import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true } });

export interface UserProfile { id: string; email: string; name: string; }

export const register = async (email: string, password: string, name?: string): Promise<UserProfile> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: name || email.split('@')[0] } },
  });
  if (error) throw new Error(error.message);
  const user = data?.user ?? data?.session?.user;
  if (!user) throw new Error('Não foi possível criar a conta. Tente novamente.');
  return { id: String(user.id), email: user.email!, name: user.user_metadata?.name ?? email.split('@')[0] };
};

export const login = async (email: string, password: string): Promise<UserProfile> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  const user = data?.user ?? data?.session?.user;
  if (!user) throw new Error('User not found');
  return { id: String(user.id), email: user.email!, name: user.user_metadata?.name ?? user.email!.split('@')[0] };
};

export const logout = async (): Promise<void> => { await supabase.auth.signOut(); };

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.user) return null;
  const user = data.session.user;
  return { id: String(user.id), email: user.email!, name: user.user_metadata?.name ?? user.email!.split('@')[0] };
};
/* ------------------------------------------------------------------
 * Economia de egress (Vercel <-> Supabase):
 * - cache em memória de 30s evita leituras repetidas no mesmo cliente
 * - invalidação imediata após escritas (like/dislike/watchlist)
 * - selects limitados às colunas realmente usadas pela UI
 * ------------------------------------------------------------------ */
const cache = new Map<string, { v: any; t: number }>();
const TTL = 30_000;
function memo<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < TTL) return Promise.resolve(hit.v as T);
  return fn().then(v => { cache.set(key, { v, t: Date.now() }); return v; });
}
function invalidatePrefix(prefix: string) {
  for (const k of cache.keys()) if (k.startsWith(prefix)) cache.delete(k);
}

export const getWatchlist = async (): Promise<any[]> => {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data: rows } = await supabase
    .from('watchlist')
    .select('title_id, type, title, poster_path')
    .eq('user_id', user.id);
  return rows ?? [];
};

export const addToWatchlist = async (item: any): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Login required');
  await supabase.from('watchlist').insert([{ ...item, user_id: user.id }]);
  invalidatePrefix(`wl:${user.id}`);
};

export const removeFromWatchlist = async (titleId: number): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Login required');
  await supabase.from('watchlist').delete().eq('user_id', user.id).eq('title_id', titleId);
  invalidatePrefix(`wl:${user.id}`);
};

export const toggleLiked = async (titleId: number, type: 'movie' | 'tv'): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Login required');

  // Remove ALL existing records for this user and title_id (regardless of genre or action)
  await supabase
    .from('genres')
    .delete()
    .eq('user_id', user.id)
    .eq('title_id', Number(titleId))
    .eq('type', type);

  // Insert the new Liked record
  const { error } = await supabase.from('genres').insert([{
    user_id: user.id,
    title_id: Number(titleId),
    type,
    action: 'Liked',
    genre: 'Liked'
  }]);

  if (error) throw error;
  invalidatePrefix(`likes:${user.id}`);
  return true;
};

export const getLikedIds = async (): Promise<number[]> => {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data: rows } = await supabase.from('genres').select('title_id').eq('user_id', user.id).eq('genre', 'Liked');
  return rows?.map((r: any) => Number(r.title_id)) ?? [];
};

export const toggleDisliked = async (titleId: number, type: 'movie' | 'tv'): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Login required');
  const { data: existing } = await supabase.from('genres').select('id, title_id, type').eq('user_id', user.id).eq('genre', 'Disliked');
  const relatedRows = existing ? existing.filter((e: any) => e.type === type && Number(e.title_id) === titleId) : [];
  if (relatedRows.length > 0) {
    await supabase.from('genres').delete().eq('id', relatedRows[0].id);
    invalidatePrefix(`dis:${user.id}`);
    return false;
  } else {
    await supabase.from('genres').insert([{
      user_id: user.id,
      title_id: Number(titleId),
      type,
      action: 'Disliked',
      genre: 'Disliked'
    }]);
    invalidatePrefix(`dis:${user.id}`);
    return true;
  }
};

export const getDislikedIds = async (): Promise<number[]> => {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data: rows } = await supabase.from('genres').select('title_id').eq('user_id', user.id).eq('genre', 'Disliked');
  return rows?.map((r: any) => Number(r.title_id)) ?? [];
};

export async function fetchTrending(type: 'movie' | 'tv'): Promise<any[]> {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
  const token = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN!;
  const url = `https://api.themoviedb.org/3/trending/${type}/day?api_key=${key}&language=pt-BR`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((i: any) => ({
    id: i.id,
    title: i.title || i.name || i.original_title || i.original_name,
    poster_path: i.poster_path,
    backdrop_path: i.backdrop_path,
    overview: i.overview,
    vote_average: i.vote_average,
    vote_count: i.vote_count,
    release_date: i.release_date || i.first_air_date,
    original_language: i.original_language,
    type,
  }));
}

export async function fetchDetail(type: 'movie' | 'tv', id: number): Promise<any> {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
  const token = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN!;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?append_to_response=credits,watch_providers&language=pt-BR`, { headers });
  if (!res.ok) return null;
  return res.json();
}

export interface DiscoverPage {
  items: any[];
  totalPages: number;
  totalResults: number;
}

export async function fetchDiscover(
  type: 'movie' | 'tv',
  year: number,
  page = 1,
  genreId?: number,
): Promise<DiscoverPage> {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
  const yearParam = type === 'movie' ? 'primary_release_year' : 'first_air_date_year';
  const params = new URLSearchParams({
    api_key: key,
    [yearParam]: String(year),
    page: String(page),
    sort_by: 'popularity.desc',
  });
  if (genreId) params.set('with_genres', String(genreId));
  const res = await fetch(`https://api.themoviedb.org/3/discover/${type}?${params}&language=pt-BR`);
  if (!res.ok) return { items: [], totalPages: 1, totalResults: 0 };
  const data = await res.json();
  return {
    items: (data.results || []).map((i: any) => ({
      id: i.id,
      title: i.title || i.name,
      poster_path: i.poster_path,
      backdrop_path: i.backdrop_path,
      overview: i.overview,
      vote_average: i.vote_average,
      release_date: i.release_date || i.first_air_date,
      type,
    })),
    totalPages: data.total_pages ?? 1,
    totalResults: data.total_results ?? 0,
  };
}

export async function fetchTrailer(type: 'movie' | 'tv', id: number): Promise<string | null> {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
  const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${key}&language=pt-BR`);
  if (!res.ok) return null;
  const data = await res.json();
  const trailer = data.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
  return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
}

export async function fetchGenres(type: 'movie' | 'tv'): Promise<{ id: number; name: string }[]> {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
  const res = await fetch(`https://api.themoviedb.org/3/genre/${type}/list?api_key=${key}&language=pt-BR`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.genres ?? [];
}

export const getLikedItems = async (): Promise<any[]> => {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data: rows } = await supabase.from('genres').select('title_id, type').eq('user_id', user.id).eq('genre', 'Liked');
  return rows ?? [];
};

export const getDislikedItems = async (): Promise<any[]> => {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data: rows } = await supabase.from('genres').select('title_id, type').eq('user_id', user.id).eq('genre', 'Disliked');
  return rows ?? [];
};

export async function fetchSearch(query: string): Promise<any[]> {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
  const params = new URLSearchParams({
    api_key: key,
    query: query,
    language: 'pt-BR',
  });
  const [movies, tv] = await Promise.all([
    fetch(`https://api.themoviedb.org/3/search/movie?${params}`).then(r => r.json()),
    fetch(`https://api.themoviedb.org/3/search/tv?${params}`).then(r => r.json())
  ]);
  return [
    ...(movies.results || []).map((i: any) => ({ ...i, type: 'movie', title: i.title || i.name })),
    ...(tv.results || []).map((i: any) => ({ ...i, type: 'tv', title: i.title || i.name }))
  ].slice(0, 12);
}


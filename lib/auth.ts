import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true } });

export interface UserProfile { id: string; email: string; name: string; }

export const register = async (email: string, password: string): Promise<UserProfile> => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  const user = data?.user ?? data?.session?.user;
  if (!user) return { id: 'mock', email, name: email.split('@')[0] };
  return { id: String(user.id), email: user.email!, name: user.user_metadata?.name ?? user.email!.split('@')[0] };
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

export const getWatchlist = async (): Promise<any[]> => {
  const user = await getCurrentUser();
  if (!user) return [];
  const { data: rows } = await supabase.from('watchlist').select('*').eq('user_id', user.id);
  return rows ?? [];
};

export const addToWatchlist = async (item: any): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Login required');
  await supabase.from('watchlist').insert([{ ...item, user_id: user.id }]);
};

export const removeFromWatchlist = async (titleId: number): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Login required');
  await supabase.from('watchlist').delete().eq('user_id', user.id).eq('title_id', titleId);
};

export const toggleLiked = async (titleId: number, type: 'movie' | 'tv'): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Login required');
  const { data: existing } = await supabase.from('genres').select('title_id, type').eq('user_id', user.id);
  const relatedRows = existing ? existing.filter((e: any) => e.type === type && Number(e.title_id) === titleId) : [];
  if (relatedRows.length > 0) {
    await supabase.from('genres').delete().eq('user_id', user.id).eq('title_id', titleId).eq('type', type);
    return false;
  } else {
    await supabase.from('genres').insert({ user_id: user.id, title_id: titleId, type, genre: 'Liked' });
    return true;
  }
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
  const { data: existing } = await supabase.from('genres').select('title_id, type').eq('user_id', user.id);
  const relatedRows = existing ? existing.filter((e: any) => e.type === type && Number(e.title_id) === titleId) : [];
  if (relatedRows.length > 0) {
    await supabase.from('genres').delete().eq('user_id', user.id).eq('title_id', titleId).eq('type', type);
    return false;
  } else {
    await supabase.from('genres').insert({ user_id: user.id, title_id: titleId, type, genre: 'Disliked' });
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
  const url = `https://api.themoviedb.org/3/trending/${type}/day?api_key=${key}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results || []).map((i: any) => ({
    id: i.id,
    title: i.title || i.original_title,
    poster_path: i.poster_path,
    backdrop_path: i.backdrop_path,
    overview: i.overview,
    vote_average: i.vote_average,
    vote_count: i.vote_count,
    release_date: i.release_date,
    original_language: i.original_language,
    type,
  }));
}

export async function fetchDetail(type: 'movie' | 'tv', id: number): Promise<any> {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
  const token = process.env.NEXT_PUBLIC_TMDB_READ_TOKEN!;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`https://api.themoviedb.org/3/${type}/${id}?append_to_response=credits,watch_providers`, { headers });
  if (!res.ok) return null;
  return res.json();
}

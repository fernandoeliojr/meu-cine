'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  fetchTrending, fetchDiscover, fetchGenres, fetchTrailer,
  toggleLiked, toggleDisliked, addToWatchlist, removeFromWatchlist,
  getWatchlist, getCurrentUser, getLikedIds, getDislikedIds,
} from '../lib/auth';

const CURRENT_YEAR = new Date().getFullYear();
const PAGE_SIZE = 24;

/** Mostra no máximo 5 números de página centrados na atual + "…" se houver mais */
function pageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.min(Math.max(1, current - 2), total - 4);
  const out: (number | string)[] = Array.from({ length: 5 }, (_, i) => start + i);
  if (start + 4 < total) out.push('…');
  return out;
}

export default function Home() {
  const [type, setType] = useState<'movie' | 'tv'>('movie');
  const [page, setPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [items, setItems] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [genreId, setGenreId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetchGenres(type).then(setGenres);
    getCurrentUser().then(u => setLoggedIn(!!u));
  }, [type]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // TMDB devolve 20 itens/página; buscamos 2 páginas e mostramos exatos 24
      const [a, b] = await Promise.all([
        genreId
          ? fetchDiscover(type, selectedYear, page, genreId)
          : fetchDiscover(type, selectedYear, page),
        genreId
          ? fetchDiscover(type, selectedYear, page + 1, genreId)
          : fetchDiscover(type, selectedYear, page + 1),
      ]);
      const all = [...a.items, ...b.items].slice(0, PAGE_SIZE);
      setItems(all);
      setTotalPages(Math.min(a.totalPages, 500));
      setTotalResults(a.totalResults);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [type, page, genreId, selectedYear]);

  useEffect(() => { load(); }, [load]);

  const switchType = (t: 'movie' | 'tv') => { setType(t); setPage(1); setGenreId(undefined); setSelectedYear(CURRENT_YEAR); };

  return (
    <div className="min-h-screen">
      {/* hero */}
      <HeroBanner type={type} loggedIn={loggedIn} />

      {/* seletor filmes/séries */}
      <section className="pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xl font-bold">
            {type === 'movie' ? 'Filmes' : 'Séries'} · {selectedYear}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => switchType('movie')}
              className={type === 'movie' ? 'tab active' : 'tab'}>Filmes</button>
            <button onClick={() => switchType('tv')}
              className={type === 'tv' ? 'tab active' : 'tab'}>Séries</button>
          </div>
        </div>

        {/* chips de gênero */}
        <div className="flex gap-2 flex-wrap mt-4">
          <button onClick={() => { setGenreId(undefined); setPage(1); }}
            className={genreId === undefined ? 'chip active' : 'chip'}>Todos Gêneros</button>
          {genres.map(g => (
            <button key={g.id} onClick={() => { setGenreId(g.id); setPage(1); }}
              className={genreId === g.id ? 'chip active' : 'chip'}>{g.name}</button>
          ))}
        </div>

        {/* chips de ano */}
        <div className="flex gap-2 flex-wrap mt-4">
          {Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i).map(year => (
            <button key={year} onClick={() => { setSelectedYear(year); setPage(1); }}
              className={selectedYear === year ? 'chip active' : 'chip'}>{year}</button>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-3">
          {totalResults > 0 ? `${totalResults} títulos de ${selectedYear}` : ''}
        </p>

        {/* grid */}
        {loading ? (
          <p className="text-gray-500 py-10">Carregando...</p>
        ) : items.length === 0 ? (
          <p className="text-gray-500 py-10">Nenhum título encontrado.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-4 justify-items-center">
            {items.map(item => (
              <Card key={`${item.type}-${item.id}`} item={item} loggedIn={loggedIn} />
            ))}
          </div>
        )}

        {/* paginação */}
        {!loading && totalPages > 1 && (
          <nav className="flex items-center justify-end gap-2 mt-8 mb-4" aria-label="Paginação">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 rounded border border-white/10 text-sm hover:bg-white/10 disabled:opacity-30">
              ←
            </button>
            {pageNumbers(page, totalPages).map(n =>
              n === '…' ? (
                <span key="dots" className="px-1 text-gray-500">…</span>
              ) : (
                <button key={n} onClick={() => { setPage(Number(n)); window.scrollTo({ top: 0 }); }}
                  className={n === page
                    ? 'w-8 h-8 rounded text-sm font-bold bg-[#e50914] text-white'
                    : 'w-8 h-8 rounded text-sm border border-white/10 hover:bg-white/10'}>
                  {n}
                </button>
              ),
            )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 rounded border border-white/10 text-sm hover:bg-white/10 disabled:opacity-30">
              →
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}

/* ---------- card ---------- */
function Card({ item, loggedIn }: { item: any; loggedIn: boolean }) {
  const [inWatch, setInWatch] = useState(false);
  useEffect(() => {
    if (!loggedIn) return;
    getWatchlist().then(list => setInWatch(list.some((w: any) => Number(w.title_id) === item.id && w.type === item.type))).catch(() => {});
  }, [item.id, item.type, loggedIn]);

  const title = item.title;
  const year = item.release_date?.slice(0, 4) || '';
  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
    : null;

  return (
    <div className="card">
      <Link href={`/${item.type}/${item.id}`} className="block">
        {poster ? (
          <img src={poster} alt={title} loading="lazy" />
        ) : (
          <div className="aspect-[2/3] bg-[#1e1e27] flex items-center justify-center text-gray-600 text-xs">Sem capa</div>
        )}
      </Link>
      <div className="card-meta">
        <p className="card-title">{title}</p>
        <p className="card-sub">⭐ {item.vote_average?.toFixed(1) ?? '-'} · {year}</p>
      </div>
    </div>
  );
}

/* ---------- hero ---------- */
function HeroBanner({ type, loggedIn }: { type: 'movie' | 'tv', loggedIn: boolean }) {
  const [featured, setFeatured] = useState<any>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [animatingLike, setAnimatingLike] = useState(false);
  const [animatingDislike, setAnimatingDislike] = useState(false);

  useEffect(() => {
    fetchTrending(type).then(list => {
      const withBackdrop = list.find((i: any) => i.backdrop_path) || list[0];
      setFeatured(withBackdrop || null);
    }).catch(() => {});
  }, [type]);

  const handleLike = async () => {
    if (!featured) return;
    try {
      await toggleLiked(featured.id, type);
      setAnimatingLike(true);
      setTimeout(() => setAnimatingLike(false), 300);
    } catch (e) {
      console.error(e);
      alert('Erro ao processar "Gostei".');
    }
  };

  const handleDislike = async () => {
    if (!featured) return;
    try {
      await toggleDisliked(featured.id, type);
      setAnimatingDislike(true);
      setTimeout(() => setAnimatingDislike(false), 300);
    } catch (e) {
      console.error(e);
      alert('Erro ao processar "Não gostei".');
    }
  };

  const playTrailer = async () => {
    if (!featured) return;
    const url = await fetchTrailer(type, featured.id);
    if (url) setTrailerUrl(url);
    else alert('Trailer não encontrado.');
  };

  if (!featured) return null;

  const title = featured.title;
  const year = featured.release_date?.slice(0, 4) || '';
  const backdrop = featured.backdrop_path
    ? `https://image.tmdb.org/t/p/original${featured.backdrop_path}`
    : null;

  return (
    <section className="hero">
      <div className="hero-backdrop">
        {backdrop && <img src={backdrop} alt={title} />}
        <div className="hero-shade" />
      </div>
      <div className="hero-content">
        <p className="hero-eyebrow"><span className="dot" /> Em alta hoje</p>
        <h1 className="hero-title">{title}</h1>
        <div className="hero-meta">
          <span>⭐ {featured.vote_average?.toFixed(1) ?? '-'}</span>
          <span className="badge">{year}</span>
          <span>{type === 'movie' ? 'Filme' : 'Série'}</span>
        </div>
        <p className="hero-desc">{featured.overview}</p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={playTrailer}>
            ▶ Trailer
          </button>
          {loggedIn && (
            <>
              <button onClick={handleLike}
                className={`btn btn-ghost ${animatingLike ? 'is-on' : ''}`}>
                ♥ Gostei
              </button>
              <button onClick={handleDislike}
                className={`btn btn-ghost ${animatingDislike ? 'is-on' : ''}`}>
                ✘ Não Gostei
              </button>
            </>
          )}
        </div>
      </div>
      {trailerUrl && (
        <div className="fixed inset-0 z-[3000] grid place-items-center bg-black/90 p-4" onClick={() => setTrailerUrl(null)}>
          <button className="absolute top-4 right-4 text-white text-3xl font-bold z-[3001]" onClick={() => setTrailerUrl(null)}>×</button>
          <iframe className="w-full max-w-4xl aspect-video" src={trailerUrl} allowFullScreen />
        </div>
      )}
    </section>
  );
}

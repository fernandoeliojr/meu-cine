'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchDetail, fetchTrailer, toggleLiked, toggleDisliked, addToWatchlist, removeFromWatchlist, getWatchlist, getCurrentUser, getLikedIds, getDislikedIds } from '../../../lib/auth';

export default function MovieDetail() {
  const params = useParams<{ id: string }>();
  const [id] = useState(parseInt(params?.id || '0'));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCurrentUser().then(async (u) => {
      setLoggedIn(!!u);
      if (u) {
        const [wl, liked, disliked] = await Promise.all([
          getWatchlist(),
          getLikedIds(),
          getDislikedIds()
        ]);
        setInWatchlist(wl.some((w: any) => Number(w.title_id) === id));
        setIsLiked(liked.includes(id));
        setIsDisliked(disliked.includes(id));
      }
    });
    fetchDetail('movie', id).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    const newState = await toggleLiked(id, 'movie');
    setIsLiked(newState);
    if (newState) setIsDisliked(false); // Remove se tinha dislike
  };

  const handleDislike = async () => {
    const newState = await toggleDisliked(id, 'movie');
    setIsDisliked(newState);
    if (newState) setIsLiked(false); // Remove se tinha like
  };

  const playTrailer = async () => {
    const url = await fetchTrailer('movie', id);
    if (url) setTrailerUrl(url);
    else alert('Trailer não encontrado.');
  };

  if (loading) return <p className="p-6 text-gray-400">Carregando...</p>;
  if (!data) return <p className="p-6 text-gray-400">Nenhum resultado encontrado.</p>;

  const title = data.title;
  const year = data.release_date?.slice(0, 4) || '';
  const poster = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null;
  const backdrop = data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null;

  return (
    <div className="relative min-h-[80vh]">
      {backdrop && (
        <>
          <img src={backdrop} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-[#0a0a0f]/30 pointer-events-none" />
        </>
      )}

      <div className="relative p-6 pt-24 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {poster && (
            <div className="w-48 shrink-0 flex flex-col gap-4">
              <div className="w-full rounded-lg overflow-hidden shadow-2xl border border-white/10">
                <img src={poster} alt={title} className="w-full h-auto" />
              </div>
              <Link href="/" className="inline-flex items-center justify-center py-2 text-sm font-bold text-white/70 hover:text-white transition border border-white/20 rounded-full hover:bg-white/10">← Voltar</Link>
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">{title}</h1>

            <div className="flex flex-wrap gap-4 mb-5 text-sm font-semibold text-white/80">
              <span className="text-yellow-400">⭐ {data.vote_average?.toFixed(1)}</span>
              <span>{year}</span>
              <span>{data.runtime ? `${data.runtime} min` : ''}</span>
            </div>

            {data.genres && (
              <div className="flex flex-wrap gap-2 mb-5">
                {data.genres.map((g: any) => (
                  <span key={g.id} className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/15">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <p className="text-white/90 text-base leading-relaxed mb-8 max-w-2xl">{data.overview}</p>

            <div className="flex flex-wrap gap-3">
              <button onClick={playTrailer}
                className="px-6 py-2 rounded-full bg-transparent border border-white/30 text-white font-extrabold text-xs tracking-wide hover:bg-white/10 hover:border-white/60 transition">
                TRAILER
              </button>
              {loggedIn && (
                <>
                  <button onClick={handleLike}
                    className={`px-6 py-2 rounded-full border font-extrabold text-xs tracking-wide transition ${isLiked ? 'bg-[#e50914] border-[#e50914] text-white hover:bg-red-700' : 'bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/60'}`}>
                    GOSTEI
                  </button>
                  <button onClick={handleDislike}
                    className={`px-6 py-2 rounded-full border font-extrabold text-xs tracking-wide transition ${isDisliked ? 'bg-[#e50914] border-[#e50914] text-white hover:bg-red-700' : 'bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/60'}`}>
                    NÃO GOSTEI
                  </button>
                  <button onClick={async () => {
                    if (inWatchlist) { await removeFromWatchlist(id); setInWatchlist(false); }
                    else { await addToWatchlist({ title_id: id, type: 'movie', title, poster_path: data.poster_path, overview: data.overview }); setInWatchlist(true); }
                  }}
                    className={`px-6 py-2 rounded-full border font-extrabold text-xs tracking-wide transition ${
                      inWatchlist
                        ? 'bg-[#e50914] border-[#e50914] text-white hover:bg-red-700'
                        : 'bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/60'}`}>
                    {inWatchlist ? 'NA MINHA LISTA' : 'ASSISTIR DEPOIS'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {trailerUrl && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/90 p-4" onClick={() => setTrailerUrl(null)}>
          <button className="absolute top-4 right-4 text-white text-3xl font-bold" onClick={() => setTrailerUrl(null)}>×</button>
          <iframe className="w-full max-w-4xl aspect-video" src={trailerUrl} allowFullScreen />
        </div>
      )}
    </div>
  );
}

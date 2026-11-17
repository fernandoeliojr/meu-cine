'use client';
import { Suspense, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchDetail, toggleLiked, toggleDisliked, addToWatchlist, removeFromWatchlist, getWatchlist } from '../../../lib/auth';

export default function TvDetail() {
  return (
    <Suspense fallback={<p className="p-6 text-gray-400">Carregando...</p>}>
      <TvDetailInner />
    </Suspense>
  );
}

function TvDetailInner() {
  const params = useParams<{ id: string }>();
  const [id, setId] = useState(parseInt(params.id));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchDetail('tv', id),
      getWatchlist().then(list => setInWatchlist(list.some((w: any) => Number(w.title_id) === id))).catch(() => {}),
    ]).then(([d]) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6 text-gray-400">Carregando...</p>;
  if (!data) return <p className="p-6 text-gray-400">Nenhum resultado encontrado.</p>;

  const title = data.name || data.title;
  const year = data.first_air_date?.slice(0, 4) || '';
  const poster = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null;
  const backdrop = data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null;

  return (
    <div className="relative min-h-[80vh]">
      {backdrop && (
        <>
          <img src={backdrop} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-[#0a0a0f]/30" />
        </>
      )}

      <div className="relative p-6 pt-24 max-w-4xl mx-auto">
        <Link href="/" className="inline-block mb-6 text-sm font-bold text-white/70 hover:text-white transition">← Voltar</Link>

        <div className="flex flex-col md:flex-row gap-8">
          {poster && (
            <div className="w-48 shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10">
              <img src={poster} alt={title} className="w-full h-auto" />
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-3">{title}</h1>

            <div className="flex flex-wrap gap-4 mb-5 text-sm font-semibold text-white/80">
              <span className="text-yellow-400">⭐ {data.vote_average?.toFixed(1)}</span>
              <span>{year}</span>
              <span>{data.episode_run_time?.[0] ? `${data.episode_run_time[0]} min/ep` : ''}</span>
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
              <button onClick={() => toggleLiked(id, 'tv')}
                className="px-8 py-3 rounded-full bg-transparent border border-white/30 text-white font-extrabold text-sm tracking-wide hover:bg-white/10 hover:border-white/60 transition">
                👍 GOSTEI
              </button>
              <button onClick={() => toggleDisliked(id, 'tv')}
                className="px-8 py-3 rounded-full bg-transparent border border-white/30 text-white font-extrabold text-sm tracking-wide hover:bg-white/10 hover:border-white/60 transition">
                👎 NÃO GOSTEI
              </button>
              <button onClick={async () => {
                if (inWatchlist) { await removeFromWatchlist(id); setInWatchlist(false); }
                else { await addToWatchlist({ title_id: id, type: 'tv', title, poster_path: data.poster_path, overview: data.overview }); setInWatchlist(true); }
              }}
                className={`px-8 py-3 rounded-full border font-extrabold text-sm tracking-wide transition ${
                  inWatchlist
                    ? 'bg-[#e50914] border-[#e50914] text-white hover:bg-red-700'
                    : 'bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/60'}`}>
                {inWatchlist ? '✓ NA MINHA LISTA' : '+ ASSISTIR DEPOIS'}
              </button>
            </div>

            {data.seasons && data.seasons.length > 0 && (
              <div className="mt-10">
                <h2 className="font-bold text-lg mb-4 text-white">Temporadas</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {data.seasons.slice(0, 12).map((s: any) => (
                    <div key={s.season_number} className="border border-white/10 rounded-lg p-3 text-center bg-white/5">
                      <p className="text-yellow-400 font-black">S{s.season_number}</p>
                      <p className="text-xs text-white/60 mt-1">{s.air_date?.slice(0, 4) || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

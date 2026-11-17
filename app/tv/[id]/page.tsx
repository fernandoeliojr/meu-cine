'use client';
import { Suspense, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchDetail, toggleLiked, toggleDisliked, addToWatchlist, removeFromWatchlist, getWatchlist } from '../../../lib/auth';

const GENRE_COLORS: Record<string, string> = {
  Action: 'bg-red-100 text-red-700',
  Adventure: 'bg-orange-100 text-orange-700',
  Fantasy: 'bg-purple-100 text-purple-700',
  Comedy: 'bg-yellow-100 text-yellow-700',
  Horror: 'bg-gray-800 text-white',
  Thriller: 'bg-blue-100 text-blue-700',
  Mystery: 'bg-indigo-100 text-indigo-700',
  Drama: 'bg-pink-100 text-pink-700',
  Romance: 'bg-rose-100 text-rose-700',
  'Science Fiction': 'bg-teal-100 text-teal-700',
  Documentary: 'bg-green-100 text-green-700',
  Animation: 'bg-cyan-100 text-cyan-700',
  'TV Movie': 'bg-slate-100 text-slate-700',
  War: 'bg-stone-100 text-stone-700',
  Western: 'bg-amber-100 text-amber-700',
};

export default function TvDetail() {
  return (
    <Suspense fallback={<p className="p-6 text-gray-500">Carregando...</p>}>
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
      getWatchlist().then(list => setInWatchlist(list.some((w: any) => Number(w.title_id) === id))),
    ]).then(([d]) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const title = data?.name || data?.title;
  const poster = data?.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link href="/" className="text-blue-700 font-bold mb-6 inline-block">← Voltar</Link>
      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : data ? (
        <div className="flex flex-col md:flex-row gap-6">
          {poster && (
            <div className="w-40 h-60 bg-gray-200 rounded-lg overflow-hidden shrink-0">
              <img src={poster} alt={title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{title}</h1>
            <div className="flex gap-4 mb-4 flex-wrap">
              <span className="text-yellow-600 font-semibold">⭐ {data.vote_average} ({data.vote_count})</span>
              <span className="text-gray-500">{data.episode_run_time?.[0] || 0} min / episódio</span>
              <span className="text-gray-500">{data.first_air_date?.slice(0, 4) || ''}</span>
            </div>
            <p className="text-gray-700 text-lg mb-4">{data.overview}</p>
            {data.genres && (
              <div className="flex flex-wrap gap-2 mb-6">
                {data.genres.map((g: any) => (
                  <span key={g.id} className={`px-3 py-1 rounded-full text-sm font-medium ${GENRE_COLORS[g.name] || 'bg-gray-100 text-gray-700'}`}>
                    {g.name}
                  </span>
                ))}
              </div>
            )}
            {data.seasons && data.seasons.length > 0 && (
              <div className="mb-6">
                <h2 className="font-bold text-lg mb-3">Temporadas</h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {data.seasons.slice(0, 12).map((s: any) => (
                    <div key={s.season_number} className="border p-3 rounded text-center">
                      <p className="text-yellow-700 font-bold">S{s.season_number}</p>
                      <p className="text-xs text-gray-500 mt-1">{s.air_date || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => toggleLiked(id, 'tv')}
                className="px-4 py-2 rounded border border-red-200 text-red-600 hover:bg-red-50">👍 Gosto</button>
              <button onClick={() => toggleDisliked(id, 'tv')}
                className="px-4 py-2 rounded border border-yellow-200 text-yellow-600 hover:bg-yellow-50">👎 Não gosto</button>
              <button onClick={async () => {
                if (inWatchlist) { await removeFromWatchlist(id); setInWatchlist(false); }
                else { await addToWatchlist({ title_id: id, type: 'tv', title, poster_path: data.poster_path, overview: data.overview }); setInWatchlist(true); }
              }}
                className={`px-4 py-2 rounded border ${inWatchlist ? 'bg-green-600 text-white' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                {inWatchlist ? '✓ Na watchlist' : '+ Assistir depois'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Nenhum resultado encontrado.</p>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchTrending, toggleLiked, toggleDisliked, addToWatchlist, getLikedIds, getDislikedIds, getWatchlist } from '../lib/auth';

export default function Home() {
  const [type, setType] = useState<'movie' | 'tv'>('movie');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTrending(type).then(data => { setItems(data); setLoading(false); }).catch(() => setLoading(false));
  }, [type]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Tendências</h1>
        <div className="flex gap-1">
          <button onClick={() => setType('movie')} className={type === 'movie' ? 'font-bold text-purple-700 px-4 py-2 border rounded' : 'px-4 py-2 border rounded hover:bg-gray-100'}>Filmes</button>
          <button onClick={() => setType('tv')} className={type === 'tv' ? 'font-bold text-blue-700 px-4 py-2 border rounded' : 'px-4 py-2 border rounded hover:bg-gray-100'}>Séries</button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Nenhum resultado encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded shadow p-3 hover:shadow-md transition group">
              <Link href={`/${item.type}/${item.id}`} className="block text-left">
                <img src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} alt={item.title} className="w-full h-auto rounded mb-2" />
                <h2 className="text-sm font-semibold truncate group-hover:text-purple-700">{item.title}</h2>
              </Link>
              <div className="flex items-center justify-between mt-2">
                <span className="text-yellow-600 font-semibold text-xs">⭐ {item.vote_average}</span>
                <span className="text-gray-500 text-xs">{item.release_date?.slice(0, 4) || ''}</span>
              </div>
              <div className="flex gap-1 mt-2">
                <button onClick={() => toggleLiked(item.id, item.type)}
                  className="px-2 py-0.5 rounded text-xs border border-red-200 text-red-600 hover:bg-red-50">👍 Gosto</button>
                <button onClick={() => toggleDisliked(item.id, item.type)}
                  className="px-2 py-0.5 rounded text-xs border border-yellow-200 text-yellow-600 hover:bg-yellow-50">👎 Não</button>
                <button onClick={() => addToWatchlist({ title_id: item.id, type: item.type, title: item.title, poster_path: item.poster_path, overview: item.overview })}
                  className="px-2 py-0.5 rounded text-xs border border-green-200 text-green-600 hover:bg-green-50">+ Watch</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

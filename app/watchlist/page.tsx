'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWatchlist, removeFromWatchlist } from '../../lib/auth';

export default function Watchlist() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWatchlist().then(list => { setItems(list); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleRemove = async (titleId: number) => {
    await removeFromWatchlist(titleId);
    setItems(prev => prev.filter(i => Number(i.title_id) !== titleId));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-green-600">Assistir Depois</h1>
      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Sua watchlist está vazia. Volte para a página inicial e clique + Watch em qualquer cartaz.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {items.map((item: any) => (
            <div key={item.title_id} className="bg-white rounded shadow p-3 hover:shadow-md transition group relative">
              <Link href={`/${item.type}/${item.title_id}`} className="block text-left">
                <img src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} alt={item.title} className="w-full h-auto rounded mb-2" />
                <h2 className="text-sm font-semibold truncate group-hover:text-green-600">{item.title}</h2>
              </Link>
              <button onClick={() => handleRemove(item.title_id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs hover:bg-red-700">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

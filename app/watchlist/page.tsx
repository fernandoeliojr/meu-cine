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
    <div className="pt-32 px-4 max-w-7xl mx-auto min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Assistir depois</h1>
      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Sua lista de "Assistir depois" está vazia.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item: any) => (
            <div key={item.title_id} className="card relative group">
              <Link href={`/${item.type}/${item.title_id}`} className="block">
                <img src={`https://image.tmdb.org/t/p/w300${item.poster_path}`} alt={item.title} className="w-full h-auto rounded" />
                <div className="card-meta">
                    <p className="card-title">{item.title}</p>
                </div>
              </Link>
              <button onClick={() => handleRemove(item.title_id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#e50914] text-white text-xs hover:bg-red-700">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

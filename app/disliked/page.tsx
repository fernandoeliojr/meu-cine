'use client';
import { useState, useEffect } from 'react';
import { getDislikedItems, fetchDetail } from '../../lib/auth';
import Link from 'next/link';

export default function DislikedPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDislikedItems().then(async (list) => {
      const details = await Promise.all(list.map(async (item) => {
        const d = await fetchDetail(item.type, item.title_id);
        return { ...d, type: item.type };
      }));
      setItems(details);
      setLoading(false);
    });
  }, []);

  return (
    <div className="pt-32 px-4 max-w-7xl mx-auto min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Não gostei</h1>
      {loading ? <p>Carregando...</p> : items.length === 0 ? <p className="text-gray-500">Você ainda não tem Filmes/Séries que não gostou.</p> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map(item => (
            <Link key={`${item.type}-${item.id}`} href={`/${item.type}/${item.id}`} className="card block">
              <img src={`https://image.tmdb.org/t/p/w300${item.poster_path}`} alt={item.title || item.name} loading="lazy" />
              <div className="card-meta">
                <p className="card-title">{item.title || item.name}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

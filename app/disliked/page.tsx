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
    <div className="relative min-h-screen text-white">
      {items.length > 0 && items[0].poster_path && (
        <img src={`https://image.tmdb.org/t/p/original${items[0].poster_path}`} className="fixed inset-0 w-full h-full object-cover opacity-15" alt="" />
      )}
      <div className="fixed inset-0 bg-[#0a0a0f]/80" />
      <div className="relative z-10 pt-32 px-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Não gostei</h1>
        {loading ? <p>Carregando...</p> : items.length === 0 ? <p className="text-gray-500">Você ainda não tem Filmes/Séries que não gostou.</p> : (
          <div className="grid grid-cols-2 gap-4 mt-4 justify-items-center">
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
    </div>
  );
}

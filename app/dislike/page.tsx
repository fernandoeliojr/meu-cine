'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDislikedIds, fetchDetail } from '../../lib/auth';

export default function Dislike() {
  const [ids, setIds] = useState<number[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDislikedIds().then(async (ids) => {
      setIds(ids);
      const results = await Promise.all(ids.map(id => fetchDetail('movie', id).catch(() => fetchDetail('tv', id))));
      setItems(results.filter(Boolean));
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-yellow-600">Filmes e Séries que Não Gostei</h1>
      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Você ainda não desgostou de nenhum. Volte para a página inicial e clique 👎 em qualquer cartaz.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {items.map((item: any) => (
            <Link key={item.id} href={`/${item.title ? 'movie' : 'tv'}/${item.id}`} className="bg-white rounded shadow p-3 hover:shadow-md transition group">
              <img src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} alt={item.title || item.name} className="w-full h-auto rounded mb-2" />
              <h2 className="text-sm font-semibold truncate group-hover:text-yellow-600">{item.title || item.name}</h2>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

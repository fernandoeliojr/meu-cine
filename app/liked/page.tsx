'use client';
import { useState, useEffect } from 'react';
import { getLikedItems, fetchDetail, getCurrentUser } from '../../lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const PAGE_SIZE = 18;

export default function LikedPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then(u => {
      if (!u) {
        router.push('/');
        return;
      }
      getLikedItems().then(async (list) => {
        const details = await Promise.all(list.map(async (item) => {
          const d = await fetchDetail(item.type, item.title_id);
          return { ...d, type: item.type };
        }));
        setItems(details);
        setLoading(false);
      });
    });
  }, [router]);

  const totalPages = Math.ceil(items.length / PAGE_SIZE);
  const paginatedItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="pt-32 px-4 max-w-7xl mx-auto min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-6">Gostei</h1>
      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-500">Você ainda não tem Filmes/Séries que Gostou.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {paginatedItems.map(item => (
              <Link key={`${item.type}-${item.id}`} href={`/${item.type}/${item.id}`} className="card block">
                <img src={`https://image.tmdb.org/t/p/w300${item.poster_path}`} alt={item.title || item.name} loading="lazy" />
                <div className="card-meta">
                  <p className="card-title">{item.title || item.name}</p>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-8 mb-4">
              <button onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0 }); }} disabled={page === 1}
                className="px-3 py-1.5 rounded border border-white/10 text-sm hover:bg-white/10 disabled:opacity-30">
                Anterior
              </button>
              <span className="text-sm">Página {page} de {totalPages}</span>
              <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0 }); }} disabled={page === totalPages}
                className="px-3 py-1.5 rounded border border-white/10 text-sm hover:bg-white/10 disabled:opacity-30">
                Próxima
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

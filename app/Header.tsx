'use client';
import Link from 'next/link';
import { useState } from 'react';
import { getCurrentUser, login, register, logout, fetchSearch } from '../lib/auth';

export default function Header() {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [modal, setModal] = useState<null | 'login' | 'register'>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const results = await fetchSearch(searchQuery);
    setSearchResults(results);
    setShowSearch(true);
  };

  const open = (mode: 'login' | 'register') => { setModal(mode); setForm({ name: '', email: '', password: '' }); };
  const handleLogout = async () => { await logout(); window.location.reload(); };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[1000] h-[135px] flex items-center bg-transparent">
        <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <img src="/img/logo-fundo.png" alt="Meu Cine" className="h-[115px] w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar..." className="search-input text-sm" />
              <button type="submit" className="text-white hover:text-[#e50914] p-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>
            {user && (
              <>
                <Link href="/liked" className="text-sm text-gray-300 hover:text-white">Gostei</Link>
                <Link href="/watchlist" className="text-sm text-gray-300 hover:text-white">Assistir depois</Link>
                <button onClick={handleLogout} className="text-sm text-[#e50914]">Sair</button>
              </>
            )}
            {!user && (
              <div className="flex gap-2">
                <button onClick={() => open('register')} className="text-sm px-4 py-1.5 rounded border border-white/30 hover:bg-white/10 transition-all duration-200">Registrar</button>
                <button onClick={() => open('login')} className="text-sm px-4 py-1.5 rounded bg-[#e50914] hover:bg-[#ff0000] transition-all duration-200">Entrar</button>
              </div>
            )}
          </nav>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white text-3xl">☰</button>
        </div>

        {menuOpen && (
          <div className="md:hidden absolute top-[135px] right-4 w-32 bg-[#14141b] border border-white/10 rounded-xl p-3 flex flex-col gap-2 shadow-2xl z-[100]">
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-sm">Início</Link>
            {!user ? (
              <>
                <button onClick={() => { setMenuOpen(false); open('register'); }} className="text-left text-sm">Registrar</button>
                <button onClick={() => { setMenuOpen(false); open('login'); }} className="text-left text-sm">Entrar</button>
              </>
            ) : (
              <>
                <Link href="/liked" onClick={() => setMenuOpen(false)} className="text-sm">Gostei</Link>
                <Link href="/watchlist" onClick={() => setMenuOpen(false)} className="text-sm">Assistir depois</Link>
                <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="text-left text-sm text-[#e50914]">Sair</button>
              </>
            )}
          </div>
        )}
      </header>

      {showSearch && (
        <div className="fixed inset-0 z-[2000] bg-black/90 flex flex-col items-center pt-20 px-4">
          <button onClick={() => setShowSearch(false)} className="absolute top-4 right-4 text-white text-2xl">✕</button>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl overflow-y-auto">
            {searchResults.map(item => (
              <Link key={item.id} href={`/${item.type}/${item.id}`} onClick={() => setShowSearch(false)} className="block">
                <img src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} className="w-full rounded" />
                <p className="text-xs mt-1 truncate">{item.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
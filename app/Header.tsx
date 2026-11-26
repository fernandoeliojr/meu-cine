'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCurrentUser, login, register, logout, fetchSearch } from '../lib/auth';

export default function Header() {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [modal, setModal] = useState<null | 'login' | 'register'>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const results = await fetchSearch(searchQuery);
    setSearchResults(results);
    setShowSearch(true);
  };

  const open = (mode: 'login' | 'register') => { setModal(mode); setForm({ name: '', email: '', password: '' }); setError(''); };
  const handleLogout = async () => { await logout(); window.location.href = '/'; };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (modal === 'login') {
        await login(form.email, form.password);
        window.location.reload();
      } else {
        await register(form.email, form.password, form.name);
        alert('Cadastro realizado com sucesso!');
        setModal(null);
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
    }
  };

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-[1000] h-[135px] flex items-center !bg-transparent">
        <div className="max-w-7xl mx-auto px-16 w-full flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <img src="/img/logo-fundo.png" alt="Meu Cine" className="h-[115px] w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {user && (
              <>
                <span className="text-sm text-white">Bem-vindo, {user.name}</span>
                <Link href="/liked" className="text-sm text-white hover:text-[#e50914] transition-colors">Gostei</Link>
                <Link href="/disliked" className="text-sm text-white hover:text-[#e50914] transition-colors">Não gostei</Link>
                <Link href="/watchlist" className="text-sm text-white hover:text-[#e50914] transition-colors">Assistir depois</Link>
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Pesquisar..." className="search-input text-sm" />
                  <button type="submit" className="text-white hover:text-[#e50914] p-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </button>
                </form>
                <button onClick={handleLogout} className="text-sm px-4 py-1.5 rounded bg-[#e50914] hover:bg-[#ff0000] text-white transition-all duration-200">Sair</button>
              </>
            )}
            {!user && (
              <div className="flex gap-2">
                <button onClick={() => open('login')} className="text-sm px-4 py-1.5 rounded border border-white/30 hover:bg-white/10 text-white transition-all duration-200">Entrar</button>
                <button onClick={() => open('register')} className="text-sm px-4 py-1.5 rounded bg-[#e50914] hover:bg-[#ff0000] text-white transition-all duration-200">Registrar</button>
              </div>
            )}
          </nav>

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white text-xl bg-red-500/20 rounded p-1.5">☰</button>
        </div>

        {menuOpen && (
          <div className="md:hidden absolute top-[100px] right-4 w-32 bg-[#14151b]/90 backdrop-blur-sm border border-white/5 rounded-xl p-2 flex flex-col gap-0.5 shadow-2xl z-[100]">
            {!user ? (
              <>
                <button onClick={() => { setMenuOpen(false); open('login'); }} className="text-left text-sm text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">Entrar</button>
                <button onClick={() => { setMenuOpen(false); open('register'); }} className="text-left text-sm text-white px-3 py-1.5 rounded-lg bg-white/10 transition-colors">Registrar</button>
              </>
            ) : (
              <>
                <Link href="/liked" onClick={() => setMenuOpen(false)} className="text-sm text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">Gostei</Link>
                <Link href="/disliked" onClick={() => setMenuOpen(false)} className="text-sm text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">Não gostei</Link>
                <Link href="/watchlist" onClick={() => setMenuOpen(false)} className="text-sm text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">Assistir depois</Link>
                <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="text-left text-sm text-[#e50914] px-3 py-1.5 rounded-lg hover:bg-[#e50914]/20 transition-colors">Sair</button>
              </>
            )}
          </div>
        )}
      </header>

      {modal && (
        <div className="fixed inset-0 z-[3000] bg-black/80 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="relative bg-[#14141b] p-8 rounded-xl w-full max-w-sm border border-white/10" onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setModal(null)} className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl">✕</button>
            <h2 className="text-2xl font-bold mb-4">{modal === 'login' ? 'Entrar' : 'Registrar'}</h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {modal === 'register' && (
              <input type="text" placeholder="Nome" className="w-full bg-white/5 border border-white/10 p-2 rounded mb-3" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            )}
            <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 p-2 rounded mb-3" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            <input type="password" placeholder="Senha" className="w-full bg-white/5 border border-white/10 p-2 rounded mb-4" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            <button type="submit" className="w-full bg-[#e50914] text-white p-2 rounded font-bold hover:bg-red-700">{modal === 'login' ? 'Entrar' : 'Registrar'}</button>
          </form>
        </div>
      )}

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
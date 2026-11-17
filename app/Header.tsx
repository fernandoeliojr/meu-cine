'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCurrentUser, login, register, logout } from '../lib/auth';

export default function Header() {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<null | 'login' | 'register'>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getCurrentUser().then(setUser);
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const open = (mode: 'login' | 'register') => { setModal(mode); setError(''); setForm({ name: '', email: '', password: '' }); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      if (modal === 'register') {
        const u = await register(form.email, form.password, form.name || undefined);
        setUser(u);
      } else {
        const u = await login(form.email, form.password);
        setUser(u);
      }
      setModal(null);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Falha no autenticador.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => { await logout(); setUser(null); window.location.reload(); };

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-colors ${scrolled ? 'bg-[#0a0a0f]/95 backdrop-blur border-b border-white/10' : 'bg-gradient-to-b from-black/70 to-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="shrink-0"><img src="/img/logo.jpg" alt="Meu Cine" className="h-8" /></Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-white hover:text-[#e50914] transition">Início</Link>
          {user && (
            <>
              <Link href="/liked" className="text-sm font-medium text-gray-300 hover:text-white transition">Gostei</Link>
              <Link href="/dislike" className="text-sm font-medium text-gray-300 hover:text-white transition">Não Gostei</Link>
              <Link href="/watchlist" className="text-sm font-medium text-gray-300 hover:text-white transition">Assistir depois</Link>
            </>
          )}
          {user ? (
            <button onClick={handleLogout}
              className="text-sm font-medium px-4 py-1.5 rounded border border-white/30 hover:bg-white/10 transition">
              Sair
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => open('register')}
                className="text-sm font-semibold px-4 py-1.5 rounded border border-white/30 hover:bg-white/10 transition">
                Registrar
              </button>
              <button onClick={() => open('login')}
                className="text-sm font-semibold px-4 py-1.5 rounded bg-[#e50914] hover:bg-red-700 transition">
                Entrar
              </button>
            </div>
          )}
        </nav>

        <div className="md:hidden flex items-center gap-3">
          {user ? (
            <button onClick={handleLogout} className="text-xs font-medium px-3 py-1.5 rounded border border-white/30">Sair</button>
          ) : (
            <button onClick={() => open('login')} className="text-xs font-semibold px-3 py-1.5 rounded bg-[#e50914]">Entrar</button>
          )}
          <button onClick={() => setMenuOpen(o => !o)} className="w-9 h-9 rounded-md border border-white/20 bg-white/10 text-sm" aria-label="Menu">☰</button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-16 inset-x-4 bg-[#14141b] border border-white/10 rounded-xl p-3 flex flex-col gap-1 shadow-2xl">
          <Link href="/" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded hover:bg-white/10 text-sm">Início</Link>
          {user && (
            <>
              <Link href="/liked" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded hover:bg-white/10 text-sm">Gostei</Link>
              <Link href="/dislike" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded hover:bg-white/10 text-sm">Não Gostei</Link>
              <Link href="/watchlist" onClick={() => setMenuOpen(false)} className="px-3 py-2 rounded hover:bg-white/10 text-sm">Assistir depois</Link>
            </>
          )}
          {!user && (
            <div className="flex gap-2 pt-2 border-t border-white/10 mt-1">
              <button onClick={() => { setMenuOpen(false); open('register'); }} className="flex-1 text-xs font-semibold px-3 py-2 rounded border border-white/30">Registrar</button>
              <button onClick={() => { setMenuOpen(false); open('login'); }} className="flex-1 text-xs font-semibold px-3 py-2 rounded bg-[#e50914]">Entrar</button>
            </div>
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setModal(null)}>
          <form onClick={e => e.stopPropagation()} onSubmit={submit}
            className="w-full max-w-sm bg-[#14141b] border border-white/10 rounded-xl p-6 flex flex-col gap-3 shadow-2xl">
            <h2 className="text-lg font-bold">{modal === 'register' ? 'Criar conta' : 'Entrar'}</h2>
            {modal === 'register' && (
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nome" className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm placeholder:text-gray-500" />
            )}
            <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="E-mail" className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm placeholder:text-gray-500" />
            <input required type="password" minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Senha (mín. 6 caracteres)" className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm placeholder:text-gray-500" />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button disabled={busy} type="submit"
              className="w-full py-2 rounded bg-[#e50914] hover:bg-red-700 text-sm font-semibold disabled:opacity-50">
              {busy ? 'Aguarde...' : modal === 'register' ? 'Registrar' : 'Entrar'}
            </button>
            <p className="text-xs text-gray-500 text-center">
              {modal === 'register' ? 'Ao registrar, seus dados ficam salvos no nosso banco.' : 'Novo por aqui? Crie sua conta em Registrar.'}
            </p>
          </form>
        </div>
      )}
    </header>
  );
}

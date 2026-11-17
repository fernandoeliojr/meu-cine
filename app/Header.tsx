'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCurrentUser, logout } from '../lib/auth';

export default function Header() {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getCurrentUser().then(setUser);
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleAuth = async () => {
    if (user) {
      await logout();
      setUser(null);
      window.location.reload();
      return;
    }
    const email = prompt('E-mail');
    if (!email) return;
    const password = prompt('Senha') || '';
    try {
      const { login } = await import('../lib/auth');
      const u = await login(email, password);
      setUser(u);
      window.location.reload();
    } catch (e: any) {
      alert('Falha no login: ' + e.message);
    }
  };

  const navLink = (href: string, label: string) => (
    <Link key={href} href={href} className="text-sm font-medium text-gray-300 hover:text-white transition">
      {label}
    </Link>
  );

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-colors ${scrolled ? 'bg-[#0a0a0f]/95 backdrop-blur border-b border-white/10' : 'bg-gradient-to-b from-black/70 to-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="text-2xl font-black tracking-tight text-[#e50914]">
          MEU CINE
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-white hover:text-[#e50914] transition">Início</Link>
          {user && (
            <>
              {navLink('/liked', 'Gostei')}
              {navLink('/dislike', 'Não Gostei')}
              {navLink('/watchlist', 'Assistir depois')}
            </>
          )}
          <button onClick={handleAuth}
            className={user
              ? 'text-sm font-medium px-4 py-1.5 rounded border border-white/30 hover:bg-white/10 transition'
              : 'text-sm font-semibold px-4 py-1.5 rounded bg-[#e50914] hover:bg-red-700 transition'}>
            {user ? 'Sair' : 'Entrar'}
          </button>
        </nav>

        <div className="md:hidden flex items-center gap-3">
          <button onClick={handleAuth}
            className={user
              ? 'text-xs font-medium px-3 py-1.5 rounded border border-white/30'
              : 'text-xs font-semibold px-3 py-1.5 rounded bg-[#e50914]'}>
            {user ? 'Sair' : 'Entrar'}
          </button>
          <button onClick={() => setMenuOpen(o => !o)} className="w-9 h-9 rounded-md border border-white/20 bg-white/10 text-sm" aria-label="Menu">
            ☰
          </button>
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
        </div>
      )}
    </header>
  );
}

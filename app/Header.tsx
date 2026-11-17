'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCurrentUser, logout } from '../lib/auth';

export default function Header() {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const handleLogin = async () => {
    if (user) {
      await logout();
      setUser(null);
      return;
    }
    const email = prompt('E-mail');
    if (!email) return;
    const password = prompt('Senha') || '';
    try {
      const { login } = await import('../lib/auth');
      const u = await login(email, password);
      setUser(u);
    } catch (e: any) {
      alert('Falha no login: ' + e.message);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs">T</div>
          <span className="text-lg font-bold text-gray-900 hidden sm:inline">Trending Catalog</span>
        </a>

        <nav className="hidden md:flex items-center gap-1 shrink-0">
          <Link href="/liked" className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100">Liked</Link>
          <Link href="/dislike" className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100">Dislike</Link>
          <Link href="/watchlist" className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100">Watch</Link>
          <Link href="/" className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100">Home</Link>
          <button onClick={handleLogin}
            className={user ? 'bg-purple-600 text-white px-4 py-1.5 rounded text-sm font-medium' : 'px-3 py-1.5 border rounded text-sm hover:bg-gray-100'}>
            {user ? 'Logout' : 'Login'}
          </button>
        </nav>

        <div className="md:hidden flex gap-1 shrink-0">
          <button onClick={handleLogin}
            className={user ? 'bg-purple-600 text-white px-3 py-1 rounded text-xs' : 'px-3 py-1 border rounded text-xs'}>Login</button>
        </div>
      </div>
    </header>
  );
}

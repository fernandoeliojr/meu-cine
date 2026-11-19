'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCurrentUser, login, register, logout } from '../lib/auth';

export default function Header() {
  const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modal, setModal] = useState<null | 'login' | 'register'>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', oldPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const open = (mode: 'login' | 'register' | 'change-password') => { setModal(mode); setError(''); setSuccess(''); setForm({ name: '', email: '', password: '', oldPassword: '', newPassword: '' }); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(''); setSuccess('');
    try {
      if (modal === 'register') {
        await register(form.email, form.password, form.name || undefined);
        setSuccess('Conta criada com sucesso! Verifique seu e-mail para confirmar.');
      } else {
        const u = await login(form.email, form.password);
        setUser(u);
        setModal(null);
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação.');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => { await logout(); setUser(null); window.location.reload(); };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-[1000] bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-[135px]">
        <Link href="/" className="shrink-0 pt-2"><img src="/img/logo-fundo.png" alt="Meu Cine" className="h-[115px] w-auto" /></Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-white hover:text-[#ff0000] transition-colors duration-200">Início</Link>
          {user && (
            <>
              <Link href="/liked" className="text-sm font-medium text-gray-300 hover:text-[#ff0000] transition-colors duration-200">Gostei</Link>
              <Link href="/dislike" className="text-sm font-medium text-gray-300 hover:text-[#ff0000] transition-colors duration-200">Não Gostei</Link>
              <Link href="/watchlist" className="text-sm font-medium text-gray-300 hover:text-[#ff0000] transition-colors duration-200">Assistir depois</Link>
            </>
          )}
          {user ? (
            <div className="relative">
              <button onClick={() => setSettingsOpen(!settingsOpen)} className="text-white hover:text-[#e50914] transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#14141b] border border-white/10 rounded-xl p-2 shadow-2xl flex flex-col gap-1 text-sm">
                  <span className="px-3 py-2 text-gray-400 border-b border-white/10 mb-1">Bem vindo, {user.name}</span>
                  <button onClick={() => { setSettingsOpen(false); open('change-password'); }} className="text-left px-3 py-2 rounded hover:bg-white/10 text-white">Trocar Senha</button>
                  <button onClick={handleLogout} className="text-left px-3 py-2 rounded hover:bg-white/10 text-[#e50914]">Sair</button>
                </div>
              )}
            </div>
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
            <button onClick={() => setSettingsOpen(!settingsOpen)} className="w-9 h-9 rounded-md border border-white/20 bg-white/10 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          ) : (
            <button onClick={() => open('login')} className="text-xs font-semibold px-3 py-1.5 rounded bg-[#e50914]">Entrar</button>
          )}
          {settingsOpen && user && (
            <div className="absolute right-4 top-16 w-48 bg-[#14141b] border border-white/10 rounded-xl p-2 shadow-2xl flex flex-col gap-1 text-sm z-50">
              <span className="px-3 py-2 text-gray-400 border-b border-white/10 mb-1">Bem vindo, {user.name}</span>
              <button onClick={() => { setSettingsOpen(false); open('change-password'); }} className="text-left px-3 py-2 rounded hover:bg-white/10 text-white">Trocar Senha</button>
              <button onClick={handleLogout} className="text-left px-3 py-2 rounded hover:bg-white/10 text-[#e50914]">Sair</button>
            </div>
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
            <h2 className="text-lg font-bold">
              {modal === 'register' ? 'Criar conta' : modal === 'change-password' ? 'Trocar senha' : 'Entrar'}
            </h2>
            {modal === 'change-password' && (
              <>
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} value={form.oldPassword} onChange={e => setForm(f => ({ ...f, oldPassword: e.target.value }))}
                    placeholder="Senha antiga" className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm placeholder:text-gray-500" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-500">{showPassword ? '👁️' : '🔒'}</button>
                </div>
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                    placeholder="Nova senha" className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm placeholder:text-gray-500" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-500">{showPassword ? '👁️' : '🔒'}</button>
                </div>
              </>
            )}
            {modal === 'register' && (
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nome" className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm placeholder:text-gray-500" />
            )}
            {modal !== 'change-password' && (
              <>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="E-mail" className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm placeholder:text-gray-500" />
                <input required type="password" minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Senha (mín. 6 caracteres)" className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-sm placeholder:text-gray-500" />
              </>
            )}
            {error && <p className="text-xs text-red-400">{error}</p>}
            {success && <p className="text-xs text-green-400">{success}</p>}
            <button disabled={busy} type="submit"
              className="w-full py-2 rounded bg-[#e50914] hover:bg-red-700 text-sm font-semibold disabled:opacity-50">
              {busy ? 'Aguarde...' : modal === 'register' ? 'Registrar' : modal === 'change-password' ? 'Alterar' : 'Entrar'}
            </button>
            {modal !== 'change-password' && (
              <p className="text-xs text-gray-500 text-center">
                {modal === 'register' ? 'Ao registrar, seus dados ficam salvos no nosso banco.' : 'Novo por aqui? Crie sua conta em Registrar.'}
              </p>
            )}
          </form>
        </div>
      )}
    </header>
  );
}

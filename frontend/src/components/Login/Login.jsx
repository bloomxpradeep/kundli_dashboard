import React, { useState } from 'react';
import { Mail, Lock, Sparkles } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid username or password.');
      } else if (data?.user) {
        // Store session token in localStorage for subsequent requests
        localStorage.setItem('auth_token', data.token);
        // Pass both user and profile
        onLoginSuccess(data.user, data.profile);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-bg-base p-6">
      <div className="w-full max-w-[400px] bg-bg-card border border-border-subtle rounded-xl shadow-premium p-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-2.5 bg-neutral-950 text-white rounded-xl mb-3">
            <Sparkles size={24} />
          </div>
          <h2 className="text-xl font-bold text-text-main tracking-tight">Kundli Portal</h2>
          <p className="text-xs text-text-muted mt-1">Sign in to access your dashboard</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5" htmlFor="identifier">
              Email or Username
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 text-text-muted pointer-events-none" size={16} />
              <input
                id="identifier"
                type="text"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border-subtle rounded-lg bg-bg-card text-text-main placeholder-neutral-400 outline-none transition focus:border-neutral-900"
                placeholder="admin@example.com or johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-main uppercase tracking-wider mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 text-text-muted pointer-events-none" size={16} />
              <input
                id="password"
                type="password"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border-subtle rounded-lg bg-bg-card text-text-main placeholder-neutral-400 outline-none transition focus:border-neutral-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-2.5 px-4 mt-2 text-sm font-semibold bg-neutral-950 text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-[10px] text-text-muted leading-relaxed">
          Authorized dashboard access. External sign-ups are disabled.
        </div>
      </div>
    </div>
  );
}

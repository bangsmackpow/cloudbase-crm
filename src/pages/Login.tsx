import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subdomain, setSubdomain] = useState('default');
  const [mode, setMode] = useState<'magic' | 'password'>('password');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loginWithPassword } = useAuth() as any;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (mode === 'magic') {
        await login(email, subdomain);
        setSent(true);
      } else {
        await loginWithPassword(email, password, subdomain);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary p-6">
        <div className="glass w-full max-w-md rounded-3xl p-10 shadow-md text-center animate-in fade-in zoom-in-95 duration-700">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-success text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-primary">Check your email</h2>
          <p className="text-secondary mt-3">We've sent a magic link to <span className="font-semibold text-primary">{email}</span>.</p>
          <button 
            onClick={() => setSent(false)}
            className="mt-8 text-sm font-semibold text-accent-blue hover:underline"
          >
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-6">
      <div className="glass w-full max-w-md rounded-3xl p-10 shadow-md animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-blue text-white shadow-lg">
            <span className="text-2xl font-bold">C</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Chalkboard</h1>
          <p className="text-secondary mt-2">Sign in to your organization workspace</p>
        </div>

        <div className="flex bg-secondary/50 p-1 rounded-xl mb-8">
          <button 
            onClick={() => setMode('password')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'password' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-primary'}`}
          >
            Password
          </button>
          <button 
            onClick={() => setMode('magic')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'magic' ? 'bg-white shadow-sm text-primary' : 'text-secondary hover:text-primary'}`}
          >
            Magic Link
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-accent-danger/10 border border-accent-danger/20 text-accent-danger rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary">Organization Subdomain</label>
            <div className="relative">
              <input 
                type="text" 
                name="subdomain"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="my-company"
                required
                className="w-full rounded-xl border bg-bg-secondary px-4 py-3 outline-none focus:ring-2 focus:ring-accent-blue/20 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary font-medium">.chalkboard.com</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="luc.picard@enterprise.com"
              required
              className="w-full rounded-xl border bg-bg-secondary px-4 py-3 outline-none focus:ring-2 focus:ring-accent-blue/20 transition-all"
            />
          </div>

          {mode === 'password' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-medium text-secondary">Password</label>
              <input 
                type="password" 
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border bg-bg-secondary px-4 py-3 outline-none focus:ring-2 focus:ring-accent-blue/20 transition-all"
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl bg-accent-blue py-3 font-semibold text-white shadow-md hover:opacity-90 active:scale-[0.98] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : (mode === 'magic' ? 'Send Magic Link' : 'Sign In')}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-secondary">
          New to Chalkboard? <Link to="/register" className="font-semibold text-accent-blue hover:underline">Create a workspace</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

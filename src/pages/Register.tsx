import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [subdomain, setSubdomain] = useState('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-org-subdomain': subdomain 
        },
        body: JSON.stringify({ email, password, full_name: fullName })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }

      navigate('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-6">
      <div className="glass w-full max-w-md rounded-3xl p-10 shadow-md animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-purple text-white shadow-lg">
            <span className="text-2xl font-bold">C</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Create Account</h1>
          <p className="text-secondary mt-2">Get started with Chalkboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-accent-danger/10 border border-accent-danger/20 text-accent-danger rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary">Organization Subdomain</label>
            <div className="relative">
              <input 
                type="text" 
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="my-company"
                required
                className="w-full rounded-xl border bg-bg-secondary px-4 py-3 outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary font-medium">.chalkboard.com</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary">Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Luc Picard"
              required
              className="w-full rounded-xl border bg-bg-secondary px-4 py-3 outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="luc.picard@enterprise.com"
              required
              className="w-full rounded-xl border bg-bg-secondary px-4 py-3 outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border bg-bg-secondary px-4 py-3 outline-none focus:ring-2 focus:ring-accent-purple/20 transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl bg-accent-purple py-3 font-semibold text-white shadow-md hover:opacity-90 active:scale-[0.98] transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating Account...' : 'Create Workspace'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-secondary">
          Already have a workspace? <Link to="/login" className="font-semibold text-accent-purple hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

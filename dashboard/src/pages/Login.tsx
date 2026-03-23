import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('https://cloudbase-crm.curtislamasters.workers.dev/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (res.ok) {
      const { token } = await res.json();
      localStorage.setItem('cb_token', token);
      navigate('/');
    } else {
      alert("Access Denied: Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6">
      <div className="w-full max-w-md glass-card p-10">
        <div className="text-center mb-10">
          <div className="h-12 w-12 bg-orange-600 rounded-xl flex items-center justify-center font-bold mx-auto mb-4 text-xl text-white">C</div>
          <h1 className="text-2xl font-black text-white">CloudBase Command</h1>
          <p className="text-slate-500 text-sm mt-2">Enter your credentials to access the edge.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <input 
            type="email" placeholder="Email Address" 
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl focus:border-orange-500 outline-none transition-all"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Secure Password" 
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl focus:border-orange-500 outline-none transition-all"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="btn-primary w-full py-4 text-lg">Initialize Session</button>
        </form>
      </div>
    </div>
  );
}
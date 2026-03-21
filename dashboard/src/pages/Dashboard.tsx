import React, { useEffect, useState } from 'react';
import { Layout, Users, Zap, Search, ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from your Hono API
    fetch('http://localhost:8787/api/leads')
      .then(res => res.json())
      .then(data => {
        setLeads(data);
        setLoading(false);
      })
      .catch(err => console.error("API Error:", err));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6 space-y-8">
        <div className="text-xl font-bold text-orange-500">CloudBase</div>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 text-orange-400 bg-orange-500/10 p-2 rounded-lg">
            <Layout size={20} /> Dashboard
          </div>
          <div className="flex items-center gap-3 hover:text-white p-2 cursor-pointer">
            <Search size={20} /> Lead Hunter
          </div>
          <div className="flex items-center gap-3 hover:text-white p-2 cursor-pointer">
            <Users size={20} /> Clients
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Prospecting Pipeline</h1>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition">
            + Manual Lead
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Total Leads" value={leads.length} icon={<Search />} />
          <StatCard title="High Probability" value={leads.filter(l => l.ai_score > 80).length} icon={<Zap />} />
          <StatCard title="Pending Audits" value="3" icon={<ArrowUpRight />} />
        </div>

        {/* Lead Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-sm uppercase">
              <tr>
                <th className="p-4">Company</th>
                <th className="p-4">Status</th>
                <th className="p-4">AI Score</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="
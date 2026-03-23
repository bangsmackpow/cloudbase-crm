import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Search, Target, Zap, RefreshCw, 
  ShieldCheck, LayoutGrid, Database, FolderLock, 
  Clock, CheckSquare, Plus, DollarSign, TrendingUp, AlertTriangle
} from 'lucide-react';

const API_BASE = 'https://cloudbase-crm.curtislamasters.workers.dev/api';

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [crmStats, setCrmStats] = useState({ revenue: 0, pipe_value: 0 });
  const [activeTab, setActiveTab] = useState('leads'); 
  const [isHunting, setIsHunting] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState('disconnected');
  const [huntParams, setHuntParams] = useState({ niche: 'Dental Clinics', location: 'Creston, IA' });

  const stats = {
    discovery: leads.filter(l => l.status === 'Discovery' || l.status === 'Hunter-AI' || l.status === 'New').length,
    contacted: leads.filter(l => l.status === 'Contacted').length,
    proposal: leads.filter(l => l.status === 'Proposal').length,
    won: leads.filter(l => l.status === 'Won').length
  };

  const fetchData = async () => {
    const token = localStorage.getItem('cb_token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [lRes, tRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/leads`, { headers }),
        fetch(`${API_BASE}/crm/tasks`, { headers }),
        fetch(`${API_BASE}/crm/stats`, { headers })
      ]);
      if (lRes.ok) setLeads(await lRes.json());
      if (tRes.ok) setTasks(await tRes.json());
      if (sRes.ok) setCrmStats(await sRes.json());
    } catch (err) { console.error("Fetch failed", err); }
  };

  const triggerHunt = async () => {
    const token = localStorage.getItem('cb_token');
    if (!token) {
        alert("Authentication grid offline. Please login first.");
        return;
    }
    setIsHunting(true);
    try {
        const res = await fetch(`${API_BASE}/hunter/trigger`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(huntParams)
        });
        if (res.ok) {
            console.log("Hunt initiated successfully");
            fetchData();
        }
    } catch (err) { console.error("Hunt failed", err); }
    finally { setIsHunting(false); }
  };

  useEffect(() => {
    // Check if we need to auto-login (Mock for ease of use)
    if (!localStorage.getItem('cb_token')) {
        localStorage.setItem('cb_token', 'mock_admin_token_001'); // Temporarily enable testing
    }

    fetchData();
    const token = localStorage.getItem('cb_token');
    if (token) {
      const sse = new EventSource(`${API_BASE}/realtime/leads?token=${token}`);
      sse.onopen = () => setRealtimeStatus('connected');
      sse.onmessage = () => fetchData();
      sse.onerror = () => setRealtimeStatus('disconnected');
      return () => sse.close();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] flex font-sans selection:bg-orange-500/30 overflow-hidden">
      
      {/* Dynamic Rail Nav */}
      <aside className="w-20 bg-slate-950 border-r border-white/5 flex flex-col items-center py-8 gap-10">
         <div className="bg-orange-500 p-3 rounded-2xl shadow-2xl shadow-orange-500/30 transition-all">
            <ShieldCheck size={28} className="text-white" />
         </div>
         <div className="flex flex-col gap-6 flex-1">
             <RailIcon icon={<LayoutGrid size={22}/>} active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} label="CRM" />
             <RailIcon icon={<Database size={22}/>} active={activeTab === 'schema'} onClick={() => setActiveTab('schema')} label="Schema" />
             <RailIcon icon={<FolderLock size={22}/>} active={activeTab === 'storage'} onClick={() => setActiveTab('storage')} label="Vault" />
         </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <nav className="border-b border-white/5 bg-slate-900/10 backdrop-blur-3xl px-12 py-6 sticky top-0 z-50 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black text-white tracking-widest uppercase italic leading-none">CLOUDBASE <span className="text-orange-500">OP-CENTER</span></h1>
              <div className="flex items-center gap-2 mt-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${realtimeStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                 <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">
                    {realtimeStatus === 'connected' ? 'Grid Realtime Synced' : 'Grid Link Offline'}
                 </p>
              </div>
            </div>
            <div className="flex items-center gap-12 bg-slate-950/40 p-3 rounded-2xl border border-white/5 px-8">
                <div className="flex flex-col text-right">
                   <span className="text-[9px] text-slate-700 font-extrabold uppercase tracking-widest italic leading-none">Confirmed Revenue</span>
                   <span className="text-sm text-green-500 font-black italic tracking-tighter">${crmStats.revenue?.toLocaleString()}</span>
                </div>
                <div className="flex flex-col text-right">
                   <span className="text-[9px] text-slate-700 font-extrabold uppercase tracking-widest italic leading-none">Active Pipeline</span>
                   <span className="text-sm text-orange-500 font-black italic tracking-tighter">${crmStats.pipe_value?.toLocaleString()}</span>
                </div>
            </div>
        </nav>

        <main className="p-12 space-y-12 max-w-7xl mx-auto w-full grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
          
          <div className="xl:col-span-8 space-y-12">
            
            {/* Hunter Header with Launch Logic */}
            <section className="bg-slate-900/10 border border-white/5 rounded-[4rem] p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 blur-[120px] pointer-events-none rounded-full group-hover:bg-orange-500/10 transition-all duration-1000"></div>
              <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-16">
                <div className="max-w-xl">
                  <span className="bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full border border-orange-500/20 mb-6 inline-block italic underline underline-offset-4 decoration-orange-500/20">Discovery Engine v4</span>
                  <h2 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-[0.85]">Grid <span className="text-orange-500">Scout</span> Protocol</h2>
                  <div className="flex flex-col md:flex-row gap-6 mt-10">
                     <div className="flex-1 space-y-2">
                        <label className="text-[9px] text-slate-700 font-black uppercase tracking-widest italic">Niche Target</label>
                        <input value={huntParams.niche} onChange={e => setHuntParams({...huntParams, niche: e.target.value})} className="w-full bg-slate-950/80 border border-white/5 rounded-2xl p-4 text-white font-black italic text-xs uppercase" placeholder="e.g. Dental Clinics" />
                     </div>
                     <div className="flex-1 space-y-2">
                        <label className="text-[9px] text-slate-700 font-black uppercase tracking-widest italic">Grid Coordinates</label>
                        <input value={huntParams.location} onChange={e => setHuntParams({...huntParams, location: e.target.value})} className="w-full bg-slate-950/80 border border-white/5 rounded-2xl p-4 text-white font-black italic text-xs uppercase" placeholder="e.g. Creston, IA" />
                     </div>
                  </div>
                </div>
                <button 
                    disabled={isHunting}
                    onClick={triggerHunt}
                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-3xl transition-all ${isHunting ? 'bg-slate-800 cursor-wait animate-pulse' : 'bg-orange-500 hover:scale-110 active:scale-95 shadow-orange-500/40'}`}
                >
                   {isHunting ? <RefreshCw className="text-white animate-spin" size={32}/> : <Target size={32} className="text-white"/>}
                </button>
              </div>
            </section>

            {/* Stage Pipeline Stats */}
            <div className="grid grid-cols-4 gap-6">
               <StatCard count={stats.discovery} label="Scouted" icon={<Search size={20}/>} />
               <StatCard count={stats.contacted} label="Contacted" icon={<Users size={20}/>} />
               <StatCard count={stats.proposal} label="Proposals" icon={<TrendingUp size={20}/>} />
               <StatCard count={stats.won} label="Conversions" icon={<DollarSign size={20}/>} active />
            </div>

            {/* List Components */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
                {leads.length > 0 ? leads.map(lead => (
                  <Link to={`/lead/${lead.id}`} key={lead.id} className="group bg-slate-950/40 border border-white/5 p-8 rounded-[3.5rem] hover:border-orange-500/40 transition-all relative overflow-hidden flex flex-col justify-between h-72 shadow-3xl group">
                      <div className="absolute top-0 right-0 p-8 text-right bg-gradient-to-bl from-orange-500/10 to-transparent w-40 h-40 rounded-bl-[120px]">
                         <div className={`text-6xl font-black italic tracking-tighter drop-shadow-2xl ${lead.ai_score > 80 ? 'text-red-500' : 'text-orange-500'}`}>{lead.ai_score}</div>
                         <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic mt-1 leading-none">Risk Index</div>
                      </div>
                      <div className="flex gap-8 items-start relative z-10">
                         <div className="w-16 h-16 rounded-[2rem] bg-slate-950 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                             <Users className="text-orange-500" size={28}/>
                         </div>
                         <div className="pt-2">
                            <h3 className="text-3xl font-black text-white italic leading-none uppercase truncate w-32 tracking-tighter">{lead.company_name}</h3>
                            <p className="text-slate-600 text-[10px] uppercase font-black tracking-widest italic mt-2 flex items-center gap-2">
                               {lead.status === 'Won' ? <span className="text-green-500 flex items-center gap-1 font-black"><DollarSign size={10}/> CUSTOMER</span> : lead.status}
                            </p>
                         </div>
                      </div>
                      <div className="flex justify-between items-end border-t border-white/5 pt-8 group-hover:opacity-100 transition-opacity">
                         <div className="space-y-1">
                            <span className="text-[9px] text-slate-700 font-black uppercase tracking-widest italic block leading-none">Active Stack</span>
                            <span className="text-xs text-slate-400 font-bold italic truncate max-w-[150px] block leading-none">{lead.technical_stack?.split('|')[1]?.trim() || 'SCAN PENDING'}</span>
                         </div>
                         <span className="text-orange-500 font-black text-[10px] uppercase italic tracking-[0.2em] flex items-center gap-2 translate-x-4 group-hover:translate-x-0 transition-transform underline decoration-orange-500/20">Analyze Profile <Plus size={14}/></span>
                      </div>
                  </Link>
                )) : (
                    <div className="col-span-full border-2 border-dashed border-white/5 rounded-[4rem] p-32 text-center text-slate-800">
                        <Zap size={80} className="mx-auto mb-6 opacity-20" />
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">No Active Signals</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest mt-2">Initiate Grid Scout to discover leads</p>
                    </div>
                )}
            </div>
          </div>

          <aside className="xl:col-span-4 space-y-12">
             <div className="bg-slate-950 border border-white/10 rounded-[4.5rem] p-12 space-y-12 shadow-3xl h-fit border-l-4 border-l-orange-500/20">
                <header className="flex justify-between items-center border-b border-white/5 pb-8">
                   <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-4">
                      <Clock className="text-orange-500" size={32} /> Mission Deck
                   </h3>
                   <div className="w-10 h-10 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center text-slate-600">
                      <Plus size={18}/>
                   </div>
                </header>

                <div className="space-y-8 min-h-[300px]">
                   {tasks.length > 0 ? tasks.map(t => (
                      <div key={t.id} className="relative group cursor-pointer flex gap-6">
                         <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-700 group-hover:border-orange-500 transition-all">
                            <CheckSquare size={18}/>
                          </div>
                         <div className="flex-1">
                            <h4 className="text-base font-black text-white italic uppercase leading-none tracking-tight underline decoration-white/5 mb-1">{t.title}</h4>
                            <p className="text-[10px] font-black text-orange-500/60 uppercase italic tracking-widest">{t.company_name}</p>
                         </div>
                      </div>
                   )) : (
                      <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] text-slate-700">
                         <CheckSquare size={64} className="mx-auto mb-4 opacity-50"/>
                         <p className="font-black italic uppercase text-xs tracking-widest">Horizon Clear</p>
                      </div>
                   )}
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col gap-6">
                    <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5">
                        <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest italic leading-none">Grid Sync</span>
                        <span className={`text-xs font-black italic uppercase leading-none ${realtimeStatus === 'connected' ? 'text-orange-500' : 'text-red-500'}`}>
                            {realtimeStatus === 'connected' ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
             </div>
          </aside>

        </main>
      </div>
    </div>
  );
}

function StatCard({ count, label, active }: any) {
  return (
    <div className={`bg-slate-950 border p-10 rounded-[4rem] text-center shadow-2xl relative group overflow-hidden ${active ? 'border-orange-500/30 shadow-orange-500/5' : 'border-white/5 hover:border-orange-500/10'} transition-all`}>
       {active && <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transition-opacity"><DollarSign className="text-orange-500" size={120}/></div>}
       <div className={`text-6xl font-black italic mb-2 tracking-tighter ${active ? 'text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'text-white'}`}>{count || 0}</div>
       <div className="text-[10px] text-slate-600 uppercase font-black tracking-[0.4em] italic leading-none">{label}</div>
    </div>
  );
}

function RailIcon({ icon, active, onClick, label }: any) {
  return (
    <div onClick={onClick} className={`relative group cursor-pointer p-4 rounded-2xl transition-all ${active ? 'bg-orange-500/10 text-orange-500 shadow-2xl shadow-orange-500/20' : 'text-slate-800 hover:text-slate-300'}`}>
       {icon}
       <span className="absolute left-full ml-6 bg-slate-950 border border-white/10 text-[10px] text-white font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all z-[100] pointer-events-none whitespace-nowrap shadow-3xl">{label}</span>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Search, Target, Zap, RefreshCw, 
  ShieldCheck, LayoutGrid, Database, FolderLock, 
  Clock, CheckSquare, Plus, DollarSign, TrendingUp,
  FileText, Activity, HardDrive, Trash2, ExternalLink,
  ChevronRight, BarChart3, Info, X
} from 'lucide-react';

const API_BASE = 'https://cloudbase-crm.curtislamasters.workers.dev/api';

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [crmStats, setCrmStats] = useState({ revenue: 0, pipe_value: 0 });
  const [activeTab, setActiveTab] = useState('crm'); 
  const [isHunting, setIsHunting] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState('disconnected');
  const [huntParams, setHuntParams] = useState({ niche: 'Law Firms', location: 'Des Moines, IA' });
  
  // Data for "BaaS" side
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [objects, setObjects] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    } catch (err) { console.error("CRM Fetch failed", err); }
  };

  const fetchBaaSData = async (tab: string) => {
    const token = localStorage.getItem('cb_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    setIsLoading(true);
    try {
      if (tab === 'schema') {
        const res = await fetch(`${API_BASE}/schema/collections`, { headers });
        const data = await res.json();
        setCollections(data.tables || []);
      }
      if (tab === 'storage') {
          const res = await fetch(`${API_BASE}/leads`, { headers });
          const leads = await res.json();
          setObjects(leads.map((l: any) => ({ name: `audit_${l.id.slice(0,4)}.pdf`, size: '2.4MB', lead: l.company_name })));
      }
      if (tab === 'logs') {
          const res = await fetch(`${API_BASE}/crm/activities/all`, { headers }).catch(() => null);
          if (res?.ok) setLogs(await res.json());
      }
    } catch (err) { console.error("BaaS Fetch failed", err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (!localStorage.getItem('cb_token')) {
        localStorage.setItem('cb_token', 'mock_admin_token_001');
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

  useEffect(() => {
      if (activeTab !== 'crm') fetchBaaSData(activeTab);
  }, [activeTab]);

  const triggerHunt = async () => {
    const token = localStorage.getItem('cb_token');
    setIsHunting(true);
    try {
        await fetch(`${API_BASE}/hunter/trigger`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(huntParams)
        });
        fetchData();
    } catch (err) { console.error("Hunt failed", err); }
    finally { setIsHunting(false); }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex font-sans selection:bg-orange-500/30 overflow-hidden text-slate-300">
      
      {/* 🚀 Vertical Command Rail */}
      <aside className="w-24 bg-slate-950 border-r border-white/5 flex flex-col items-center py-10 gap-12 z-[60]">
         <div className="bg-orange-500 p-4 rounded-3xl shadow-3xl shadow-orange-500/30 animate-pulse">
            <ShieldCheck size={32} className="text-white" />
         </div>
         <div className="flex flex-col gap-8 flex-1">
             <RailIcon icon={<LayoutGrid size={24}/>} active={activeTab === 'crm'} onClick={() => setActiveTab('crm')} label="CRM Ops" />
             <RailIcon icon={<Users size={24}/>} active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} label="Network" />
             <RailIcon icon={<Database size={24}/>} active={activeTab === 'schema'} onClick={() => setActiveTab('schema')} label="Schema" />
             <RailIcon icon={<FolderLock size={24}/>} active={activeTab === 'storage'} onClick={() => setActiveTab('storage')} label="R2 Vault" />
             <RailIcon icon={<Activity size={24}/>} active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} label="Audit Log" />
         </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <nav className="border-b border-white/5 bg-slate-900/10 backdrop-blur-3xl px-16 py-8 sticky top-0 z-50 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-white tracking-widest uppercase italic leading-none">CLOUDBASE <span className="text-orange-500">OP-CENTER</span></h1>
              <div className="flex items-center gap-3 mt-3">
                 <div className={`w-2 h-2 rounded-full ${realtimeStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none">
                    {realtimeStatus === 'connected' ? 'Grid Logic Synced' : 'Grid Offline'}
                 </p>
              </div>
            </div>
            <div className="flex items-center gap-16 bg-slate-950/40 p-4 rounded-3xl border border-white/5 px-12 shadow-2xl">
                <div className="flex flex-col text-right">
                   <span className="text-[10px] text-slate-700 font-extrabold uppercase tracking-widest italic leading-none">Confirmed Rev</span>
                   <span className="text-lg text-green-500 font-black italic tracking-tighter">${crmStats.revenue?.toLocaleString()}</span>
                </div>
                <div className="flex flex-col text-right border-l border-white/5 pl-16">
                   <span className="text-[10px] text-slate-700 font-extrabold uppercase tracking-widest italic leading-none">Active Pipeline</span>
                   <span className="text-lg text-orange-500 font-black italic tracking-tighter">${crmStats.pipe_value?.toLocaleString()}</span>
                </div>
            </div>
        </nav>

        <main className="p-16 space-y-16 max-w-7xl mx-auto w-full pb-48">
          
          {activeTab === 'crm' && (
            <div className="animate-in fade-in duration-700">
              {/* Hunter Engine Form */}
              <section className="bg-slate-900/10 border border-white/5 rounded-[4.5rem] p-16 relative overflow-hidden group shadow-3xl mb-24">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[150px] pointer-events-none rounded-full group-hover:bg-orange-500/10 transition-all duration-1000"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                  <div className="lg:col-span-8 space-y-10">
                    <div>
                      <span className="bg-orange-500/10 text-orange-500 text-xs font-black uppercase tracking-[0.5em] px-5 py-2 rounded-full border border-orange-500/20 mb-8 inline-block italic underline underline-offset-8 decoration-orange-500/20">Lead Hunter v4.2</span>
                      <h2 className="text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8] mb-4">Launch <br/> <span className="text-orange-500">Grid Scout</span></h2>
                      <p className="text-slate-400 text-lg font-bold italic opacity-60">Provision D1 leads via technical entropy analysis.</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8">
                       <input value={huntParams.niche} onChange={e => setHuntParams({...huntParams, niche: e.target.value})} className="flex-1 bg-slate-950/80 border border-white/10 rounded-3xl p-6 text-white font-black italic text-sm uppercase placeholder:text-slate-800" placeholder="NICHE (e.g. Legal)" />
                       <input value={huntParams.location} onChange={e => setHuntParams({...huntParams, location: e.target.value})} className="flex-1 bg-slate-950/80 border border-white/10 rounded-3xl p-6 text-white font-black italic text-sm uppercase placeholder:text-slate-800" placeholder="COORDINATES (e.g. Des Moines)" />
                       <button 
                          disabled={isHunting}
                          onClick={triggerHunt}
                          className={`px-12 py-6 rounded-3xl font-black italic uppercase text-sm tracking-widest shadow-3xl transition-all flex items-center gap-4 ${isHunting ? 'bg-slate-900 text-slate-500' : 'bg-orange-500 text-white hover:bg-orange-400 shadow-orange-500/20'}`}
                       >
                          {isHunting ? <RefreshCw className="animate-spin" size={24}/> : <Target size={24}/>} 
                          {isHunting ? 'SCOUTING...' : 'INITIATE'}
                       </button>
                    </div>
                  </div>
                  <div className="lg:col-span-4 flex justify-center">
                     <div className="w-56 h-56 bg-slate-950 border border-white/5 rounded-[4rem] flex flex-col items-center justify-center p-8 text-center shadow-3xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-orange-500/5 translate-y-full group-hover:translate-y-0 transition-all duration-700"></div>
                        <BarChart3 className="text-orange-500 mb-6" size={60} />
                        <div className="text-5xl font-black text-white italic tracking-tighter leading-none mb-2">{leads.length}</div>
                        <div className="text-[10px] text-slate-700 font-black uppercase tracking-widest italic">Signal Strength</div>
                     </div>
                  </div>
                </div>
              </section>

              {/* Leads Grid */}
              <div className="space-y-12">
                <div className="flex justify-between items-end border-b border-white/5 pb-8">
                   <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-6">
                      <LayoutGrid className="text-orange-500" size={40} /> Open Opportunities
                   </h3>
                   <div className="flex gap-4">
                      {['All', 'Proposal', 'Won'].map(f => (
                        <div key={f} className="px-6 py-2 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest italic text-slate-600 hover:text-white transition-all cursor-pointer">{f}</div>
                      ))}
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                   {leads.map(l => (
                      <Link to={`/lead/${l.id}`} key={l.id} className="group bg-slate-950/60 border border-white/10 rounded-[4rem] p-12 hover:border-orange-500/40 transition-all relative overflow-hidden flex flex-col justify-between h-80 shadow-3xl ring-0 hover:ring-[20px] ring-white/5 active:scale-95 duration-300">
                         <div className="absolute top-0 right-0 p-10">
                            <div className={`text-6xl font-black italic tracking-tighter ${l.ai_score > 80 ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]'}`}>{l.ai_score}</div>
                            <div className="text-[10px] text-slate-700 font-black uppercase tracking-widest italic text-right mt-1">Debt Index</div>
                         </div>
                         <div className="space-y-6">
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-orange-500 border border-white/5 shadow-2xl group-hover:scale-110 transition-transform"><Target size={28}/></div>
                            <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{l.company_name}</h4>
                            <p className="text-slate-500 text-xs font-bold italic leading-none">{l.website_url.replace('https://', '')}</p>
                         </div>
                         <div className="flex items-center justify-between border-t border-white/5 pt-10">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black italic uppercase tracking-widest border border-white/5 ${l.status === 'Won' ? 'bg-green-500/10 text-green-500' : 'bg-slate-900 text-slate-500'}`}>{l.status}</span>
                            <div className="flex items-center gap-2 text-orange-500 group-hover:translate-x-2 transition-transform">
                                <span className="text-[10px] font-black uppercase italic opacity-0 group-hover:opacity-100 transition-opacity">Launch Audit</span>
                                <ChevronRight size={24} />
                            </div>
                         </div>
                      </Link>
                   ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
             <div className="space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <header className="space-y-4">
                   <h2 className="text-8xl font-black text-white italic uppercase tracking-tighter leading-none">Database <span className="text-orange-500">Grid</span></h2>
                   <p className="text-slate-500 font-bold italic text-xl">D1 SQL Collections for Built Networks Core.</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                   {collections.map((t: any) => (
                      <div key={t.name} onClick={() => setSelectedCollection(t)} className="bg-slate-950 border border-white/5 p-12 rounded-[4rem] group cursor-pointer hover:border-orange-500/40 transition-all border-l-[15px] border-l-orange-500/20 shadow-3xl relative overflow-hidden active:scale-95 duration-300">
                         <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-all"></div>
                         <div className="flex justify-between items-start mb-10 relative z-10">
                            <Database size={40} className="text-orange-500 shadow-2xl" />
                            <div className="flex gap-4">
                               <Plus size={24} className="text-slate-800 hover:text-white" />
                               <Trash2 size={24} className="text-slate-800 hover:text-red-500" />
                            </div>
                         </div>
                         <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-3 relative z-10">{t.name}</h3>
                         <div className="flex gap-4 pt-8 border-t border-white/5 relative z-10">
                            <div className="px-5 py-2 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-500">sqlite_tbl</div>
                            <div className="px-5 py-2 rounded-2xl bg-slate-900 text-[10px] font-black uppercase tracking-widest text-orange-500 italic">D1 Sync</div>
                         </div>
                      </div>
                   ))}
                </div>

                {selectedCollection && (
                    <div className="fixed inset-0 z-[100] bg-[#020617]/90 backdrop-blur-xl flex justify-center items-center p-24 animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-slate-950 border border-white/10 w-full max-w-5xl rounded-[5rem] p-16 relative shadow-[0_0_100px_rgba(249,115,22,0.1)]">
                            <button onClick={() => setSelectedCollection(null)} className="absolute top-10 right-10 text-white hover:text-orange-500 transition-all"><X size={48}/></button>
                            <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter border-b border-white/5 pb-10 mb-12 flex items-center gap-8">
                                <Database size={48} className="text-orange-500" /> {selectedCollection.name}
                            </h2>
                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <h4 className="text-xs text-slate-700 font-extrabold uppercase tracking-widest italic leading-none">Schema Definition</h4>
                                    <div className="space-y-4">
                                        {['id: TEXT', 'tenant_id: TEXT', 'created_at: DATETIME', 'updated_at: DATETIME'].map(c => (
                                            <div key={c} className="bg-slate-900 p-6 rounded-3xl border border-white/5 text-lg font-black italic text-white flex justify-between uppercase">
                                                <span>{c.split(':')[0]}</span>
                                                <span className="text-orange-500">{c.split(':')[1]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-slate-900/40 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center border border-white/5">
                                    <Info className="text-slate-800 mb-6" size={80} />
                                    <p className="text-slate-600 font-black italic uppercase text-xs tracking-widest">Row interaction node pending v4.5 update</p>
                                    <button className="mt-8 bg-orange-500 text-white px-10 py-3 rounded-full font-black italic uppercase text-xs tracking-widest">View Raw Rows</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
             </div>
          )}

          {activeTab === 'storage' && (
             <div className="space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <header className="space-y-4">
                   <h2 className="text-8xl font-black text-white italic uppercase tracking-tighter leading-none underline decoration-orange-500/20 underline-offset-[20px]">R2 <span className="text-orange-500">Vault</span></h2>
                   <p className="text-slate-500 font-bold italic text-xl">Cloudflare Object Storage Parity.</p>
                </header>
                <div className="bg-slate-950 border border-white/5 p-12 rounded-[4.5rem] min-h-[500px] flex flex-col shadow-3xl">
                   <div className="flex justify-between items-center mb-16 border-b border-white/5 pb-10">
                      <div className="flex gap-10">
                         <div className="text-xs font-black text-white italic uppercase bg-orange-500/10 border border-orange-500/20 px-8 py-3 rounded-2xl">Browse ALL</div>
                         <div className="text-xs font-black text-slate-700 italic uppercase px-8 py-3">Audit Logs</div>
                         <div className="text-xs font-black text-slate-700 italic uppercase px-8 py-3">Media</div>
                      </div>
                      <button className="bg-white text-slate-950 px-10 py-3 rounded-full font-black italic uppercase text-xs tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-2xl active:scale-95 duration-300">Upload Object</button>
                   </div>
                   <div className="space-y-6">
                      {objects.map((o: any, i: number) => (
                         <div key={i} className="flex justify-between items-center p-8 bg-slate-900/10 border border-white/5 rounded-3xl hover:bg-slate-950 transition-all group cursor-pointer active:scale-[0.98]">
                            <div className="flex items-center gap-8">
                               <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-slate-600 group-hover:text-orange-500 transition-all"><FileText size={24}/></div>
                               <div>
                                  <h4 className="text-lg font-black text-white italic uppercase tracking-tight">{o.name}</h4>
                                  <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest italic">Origin: {o.lead}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-10">
                               <span className="text-xs font-black text-slate-700 italic uppercase">Size: {o.size}</span>
                               <ExternalLink size={24} className="text-slate-700 group-hover:text-orange-500 transition-all" />
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'logs' && (
             <div className="space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <header className="space-y-4">
                   <h2 className="text-8xl font-black text-white italic uppercase tracking-tighter leading-none">Security <span className="text-orange-500">Audit</span></h2>
                   <p className="text-slate-500 font-bold italic text-xl">Tenant Infrastructure Event Trace.</p>
                </header>
                <div className="bg-slate-950 border border-white/10 p-12 rounded-[4rem] space-y-8 font-mono shadow-3xl">
                   <div className="flex justify-between items-center text-[10px] text-slate-700 font-black uppercase tracking-widest italic border-b border-white/5 pb-6">
                      <span className="w-48">Timestamp</span>
                      <span className="flex-1 px-8">Audit Vector</span>
                      <span className="w-32 text-right">Protocol</span>
                   </div>
                   {[0,1,2,3,4,5,6,7].map(idx => (
                      <div key={idx} className="flex justify-between items-center text-xs py-5 border-b border-white/5 hover:bg-slate-900/40 transition-all px-4 rounded-xl group cursor-crosshair">
                         <span className="text-slate-500 font-bold w-48">2026.03.22 21:05:4{idx}</span>
                         <span className="text-white font-black italic uppercase flex-1 px-8 group-hover:text-orange-500 transition-colors">Audit Sequence 00x{idx} initiated on D1 Grid Node</span>
                         <span className="text-orange-500 font-black uppercase w-32 text-right tracking-widest group-hover:animate-pulse">OK_SYNC</span>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'contacts' && (
              <div className="space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <header className="space-y-4">
                   <h2 className="text-8xl font-black text-white italic uppercase tracking-tighter leading-none">Contact <span className="text-orange-500">Fabric</span></h2>
                   <p className="text-slate-500 font-bold italic text-xl">Aggregated Global Identity Node.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                   {leads.map(l => (
                      <div key={l.id} className="bg-slate-950 border border-white/5 p-12 rounded-[4.5rem] shadow-3xl relative overflow-hidden group hover:border-orange-500/20 transition-all">
                         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-150 transition-all duration-1000"><ShieldCheck className="text-orange-500" size={150}/></div>
                         <div className="flex justify-between items-center border-b border-white/5 pb-8 mb-8 relative z-10">
                            <div>
                               <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{l.company_name}</h3>
                               <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest italic mt-2">Mission Signal Active</p>
                            </div>
                            <Link to={`/lead/${l.id}`} className="w-14 h-14 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center text-slate-600 hover:text-white hover:border-orange-500/40 transition-all active:scale-95"><ChevronRight size={32}/></Link>
                         </div>
                         <div className="text-center py-10 relative z-10">
                            <Users size={64} className="mx-auto mb-6 text-slate-900" />
                            <p className="text-xs text-slate-700 font-black uppercase italic tracking-widest">No local Identities logged yet for this node</p>
                            <button className="mt-8 bg-slate-900 text-orange-500 border border-orange-500/20 px-8 py-3 rounded-full text-[10px] font-black uppercase italic hover:bg-orange-500 hover:text-white transition-all">Provision Human Intel</button>
                         </div>
                      </div>
                   ))}
                </div>
              </div>
          )}

        </main>
      </div>
    </div>
  );
}

function StatCard({ count, label, active }: any) {
  return (
    <div className={`bg-slate-950 border p-12 rounded-[4.5rem] shadow-3xl relative group overflow-hidden ${active ? 'border-orange-500/30' : 'border-white/5 hover:border-orange-500/10'} transition-all active:scale-95 duration-300`}>
       {active && <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-opacity group-hover:scale-110 duration-1000"><DollarSign className="text-orange-500" size={140}/></div>}
       <div className={`text-7xl font-black italic mb-3 tracking-tighter leading-none ${active ? 'text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'text-white'}`}>{count || 0}</div>
       <div className="text-[10px] text-slate-700 uppercase font-black tracking-[0.5em] italic leading-none">{label}</div>
    </div>
  );
}

function RailIcon({ icon, active, onClick, label }: any) {
  return (
    <div onClick={onClick} className={`relative group cursor-pointer p-5 rounded-[1.8rem] transition-all duration-300 ${active ? 'bg-orange-500/10 text-orange-500 shadow-3xl shadow-orange-500/10 border border-orange-500/20' : 'text-slate-800 hover:text-slate-300 hover:bg-slate-900/50'}`}>
       {icon}
       <span className="absolute left-full ml-8 bg-slate-950 border border-white/10 text-[10px] text-white font-black uppercase tracking-[0.2em] px-6 py-3 rounded-2xl opacity-0 group-hover:opacity-100 transition-all z-[100] pointer-events-none whitespace-nowrap shadow-3xl italic">{label}</span>
    </div>
  );
}
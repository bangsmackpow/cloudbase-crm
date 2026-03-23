import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Search, Target, Zap, RefreshCw, 
  ShieldCheck, LayoutGrid, Database, FolderLock, 
  Clock, CheckSquare, Plus, DollarSign, TrendingUp,
  FileText, Activity, HardDrive, Trash2, ExternalLink,
  ChevronRight, BarChart3, Info, X, Globe
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
          const d = await res.json();
          setObjects(d.map((l: any) => ({ name: `audit_${l.id.slice(0,4)}.pdf`, size: '2.4MB', lead: l.company_name })));
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
      if (activeTab !== 'crm' && activeTab !== 'contacts') fetchBaaSData(activeTab);
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
      
      {/* 🛡️ WIDE STATIC SIDEBAR (No more hidden menus) */}
      <aside className="w-80 bg-slate-950 border-r border-white/5 flex flex-col p-10 z-[60]">
         <div className="flex items-center gap-5 mb-16">
            <div className="bg-orange-500 p-4 rounded-3xl shadow-3xl shadow-orange-500/30">
               <ShieldCheck size={32} className="text-white" />
            </div>
            <div>
               <h2 className="text-xl font-black text-white italic leading-none">CLOUDBASE</h2>
               <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.2em] mt-2">Built Networks</p>
            </div>
         </div>

         <nav className="flex flex-col gap-4 flex-1">
             <SideNavItem icon={<LayoutGrid size={22}/>} label="Dashboard" active={activeTab === 'crm'} onClick={() => setActiveTab('crm')} />
             <SideNavItem icon={<Users size={22}/>} label="Network Matrix" active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
             
             <div className="mt-12 mb-4 text-[10px] text-slate-700 font-black uppercase tracking-[0.4em] italic pl-4">Infrastructure</div>
             <SideNavItem icon={<Database size={22}/>} label="D1 Schema Control" active={activeTab === 'schema'} onClick={() => setActiveTab('schema')} />
             <SideNavItem icon={<FolderLock size={22}/>} label="R2 Object Vault" active={activeTab === 'storage'} onClick={() => setActiveTab('storage')} />
             <SideNavItem icon={<Activity size={22}/>} label="Audit Event Log" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
         </nav>

         <div className="pt-10 border-t border-white/5">
            <div className="bg-slate-900/40 p-6 rounded-3xl flex justify-between items-center group cursor-pointer hover:bg-slate-900 transition-all border border-white/5">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 font-black text-xs italic border border-orange-500/20">CL</div>
                  <div className="text-xs font-black text-white italic uppercase tracking-tighter">Curtis L.</div>
               </div>
               <X className="text-slate-800" size={18} />
            </div>
         </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <nav className="border-b border-white/5 bg-slate-900/10 backdrop-blur-3xl px-16 py-8 sticky top-0 z-50 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-white tracking-widest uppercase italic leading-none">OP-CENTER <span className="text-orange-500">GRID</span></h1>
              <div className="flex items-center gap-3 mt-3">
                 <div className={`w-2 h-2 rounded-full ${realtimeStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                 <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none">
                    {realtimeStatus === 'connected' ? 'Grid Logic Synced' : 'Offline Mode'}
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

        <main className="p-16 space-y-24 max-w-7xl mx-auto w-full pb-64">
          
          {activeTab === 'crm' && (
            <div className="animate-in fade-in duration-1000">
              {/* Hunter Engine Form */}
              <section className="bg-slate-900/10 border border-white/5 rounded-[4.5rem] p-16 relative overflow-hidden group shadow-3xl mb-24 transition-all">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[150px] pointer-events-none rounded-full group-hover:bg-orange-500/10 transition-all duration-1000"></div>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                  <div className="lg:col-span-8 space-y-12">
                    <div>
                      <span className="bg-orange-500/10 text-orange-500 text-xs font-black uppercase tracking-[0.5em] px-5 py-2 rounded-full border border-orange-500/20 mb-8 inline-block italic underline underline-offset-8 decoration-orange-500/20">Lead Hunter v4.5</span>
                      <h2 className="text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.8] mb-4">Launch <br/> <span className="text-orange-500">Grid Scout</span></h2>
                      <p className="text-slate-400 text-lg font-bold italic opacity-60">Provision D1 leads via technical entropy analysis.</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8">
                       <input value={huntParams.niche} onChange={e => setHuntParams({...huntParams, niche: e.target.value})} className="flex-1 bg-slate-950/80 border border-white/10 rounded-3xl p-6 text-white font-black italic text-sm uppercase placeholder:text-slate-800" placeholder="NICHE (e.g. Legal)" />
                       <input value={huntParams.location} onChange={e => setHuntParams({...huntParams, location: e.target.value})} className="flex-1 bg-slate-950/80 border border-white/10 rounded-3xl p-6 text-white font-black italic text-sm uppercase placeholder:text-slate-800" placeholder="COORDINATES (e.g. Des Moines)" />
                       <button 
                          disabled={isHunting}
                          onClick={triggerHunt}
                          className={`px-12 py-6 rounded-3xl font-black italic uppercase text-sm tracking-widest shadow-3xl transition-all flex items-center gap-4 ${isHunting ? 'bg-slate-900 text-slate-500' : 'bg-orange-500 text-white hover:bg-orange-400 shadow-orange-500/20 active:scale-95'}`}
                       >
                          {isHunting ? <RefreshCw className="animate-spin" size={24}/> : <Target size={24}/>} 
                          {isHunting ? 'SCOUTING...' : 'INITIATE'}
                       </button>
                    </div>
                  </div>
                  <div className="lg:col-span-4 flex justify-center">
                     <div className="w-64 h-64 bg-slate-950 border border-white/5 rounded-[4rem] flex flex-col items-center justify-center p-8 text-center shadow-3xl relative overflow-hidden group hover:border-orange-500/40 transition-all cursor-crosshair">
                        <div className="absolute inset-0 bg-orange-500/5 translate-y-full group-hover:translate-y-0 transition-all duration-700 opacity-20"></div>
                        <BarChart3 className="text-orange-500 mb-6" size={80} />
                        <div className="text-6xl font-black text-white italic tracking-tighter leading-none mb-2">{leads.length}</div>
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
                   {leads.map(l => (
                      <Link to={`/lead/${l.id}`} key={l.id} className="group bg-slate-950/60 border border-white/10 rounded-[4rem] p-12 hover:border-orange-500/40 transition-all relative overflow-hidden flex flex-col justify-between h-80 shadow-3xl ring-0 hover:ring-[20px] ring-white/5 active:scale-95 duration-500">
                         <div className="absolute top-0 right-0 p-10">
                            <div className={`text-6xl font-black italic tracking-tighter ${l.ai_score > 80 ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]'}`}>{l.ai_score}</div>
                            <div className="text-[10px] text-slate-700 font-black uppercase tracking-widest italic text-right mt-1">Debt Index</div>
                         </div>
                         <div className="space-y-6">
                            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-orange-500 border border-white/5 shadow-[0_0_30px_rgba(249,115,22,0.1)] group-hover:scale-110 transition-transform"><Target size={32}/></div>
                            <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none line-clamp-1">{l.company_name}</h4>
                            <p className="text-slate-500 text-xs font-bold italic leading-none">{l.website_url.replace('https://', '')}</p>
                         </div>
                         <div className="flex items-center justify-between border-t border-white/5 pt-10">
                            <span className={`px-5 py-2 rounded-full text-[10px] font-black italic uppercase tracking-widest border border-white/5 shadow-2xl ${l.status === 'Won' ? 'bg-green-500 text-white' : 'bg-slate-900 text-slate-500'}`}>{l.status}</span>
                            <div className="flex items-center gap-3 text-orange-500 group-hover:translate-x-3 transition-transform">
                                <span className="text-[11px] font-black uppercase italic opacity-0 group-hover:opacity-100 transition-opacity">Launch Audit</span>
                                <ChevronRight size={28} />
                            </div>
                         </div>
                      </Link>
                   ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
             <div className="space-y-16 animate-in fade-in duration-700">
                <header className="space-y-6">
                   <h2 className="text-9xl font-black text-white italic uppercase tracking-tighter leading-[0.8]">Database <br/> <span className="text-orange-500">Grid Control</span></h2>
                   <p className="text-slate-500 font-bold italic text-2xl">D1 SQL Collections for Built Networks Core Infrastructure.</p>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                   {collections.map((t: any) => (
                      <div key={t.name} onClick={() => setSelectedCollection(t)} className="bg-slate-950 border border-white/5 p-12 rounded-[5rem] group cursor-pointer hover:border-orange-500/40 transition-all border-l-[20px] border-l-orange-500/20 shadow-3xl relative overflow-hidden active:scale-95 duration-300">
                         <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-all"></div>
                         <div className="flex justify-between items-start mb-12 relative z-10">
                            <Database size={48} className="text-orange-500 shadow-2xl" />
                            <div className="flex gap-4">
                               <Plus size={28} className="text-slate-800 hover:text-white" />
                               <Trash2 size={28} className="text-slate-800 hover:text-red-500" />
                            </div>
                         </div>
                         <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-4 relative z-10">{t.name}</h3>
                         <div className="flex gap-6 pt-10 border-t border-white/5 relative z-10">
                            <div className="px-6 py-2.5 rounded-2xl bg-slate-900 text-[11px] font-black uppercase tracking-widest text-slate-500">sqlite_tbl</div>
                            <div className="px-6 py-2.5 rounded-2xl bg-slate-900 text-[11px] font-black uppercase tracking-widest text-orange-500 italic">D1 Node Synced</div>
                         </div>
                      </div>
                   ))}
                </div>

                {selectedCollection && (
                    <div className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-3xl flex justify-center items-center p-24 animate-in fade-in zoom-in-95 duration-500">
                        <div className="bg-slate-950 border border-white/10 w-full max-w-5xl rounded-[6rem] p-24 relative shadow-[0_0_150px_rgba(249,115,22,0.15)]">
                            <button onClick={() => setSelectedCollection(null)} className="absolute top-12 right-12 text-slate-700 hover:text-white transition-all"><X size={60}/></button>
                            <h2 className="text-7xl font-black text-white italic uppercase tracking-tighter border-b border-white/5 pb-12 mb-16 flex items-center gap-10">
                                <Database size={64} className="text-orange-500" /> {selectedCollection.name}
                            </h2>
                            <div className="grid grid-cols-2 gap-20">
                                <div className="space-y-10">
                                    <h4 className="text-sm text-slate-700 font-extrabold uppercase tracking-[0.4em] italic leading-none">Schema Definition Matrix</h4>
                                    <div className="space-y-6">
                                        {['id: TEXT (PK)', 'tenant_id: TEXT', 'created_at: DATETIME', 'updated_at: DATETIME'].map(c => (
                                            <div key={c} className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 text-xl font-black italic text-white flex justify-between uppercase transition-all hover:border-orange-500/20">
                                                <span>{c.split(':')[0]}</span>
                                                <span className="text-orange-500">{c.split(':')[1]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-slate-900/10 rounded-[4rem] p-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5">
                                    <Info className="text-slate-800 mb-8" size={100} />
                                    <h5 className="text-2xl font-black text-white italic uppercase mb-4 tracking-tighter">Raw Data View</h5>
                                    <p className="text-slate-600 font-black italic uppercase text-xs tracking-widest leading-loose">Row interaction node pending v4.5 update. <br/> Access via query endpoint available.</p>
                                    <button className="mt-12 bg-white text-slate-950 px-16 py-5 rounded-full font-black italic uppercase text-sm tracking-widest shadow-2xl hover:bg-orange-500 hover:text-white transition-all">Query Collection</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
             </div>
          )}

          {activeTab === 'storage' && (
             <div className="space-y-16 animate-in fade-in duration-700">
                <header className="space-y-6">
                   <h2 className="text-9xl font-black text-white italic uppercase tracking-tighter leading-[0.8] underline decoration-orange-500/20 underline-offset-[30px]">R2 <span className="text-orange-500">Vault Control</span></h2>
                   <p className="text-slate-500 font-bold italic text-2xl">Cloudflare Object Storage Parity for Built Networks Media.</p>
                </header>
                <div className="bg-slate-950 border border-white/5 p-16 rounded-[5rem] min-h-[600px] flex flex-col shadow-3xl">
                   <div className="flex justify-between items-center mb-16 border-b border-white/5 pb-12">
                      <div className="flex gap-12">
                         <div className="text-sm font-black text-white italic uppercase bg-orange-500/10 border border-orange-500/30 px-10 py-4 rounded-3xl underline underline-offset-8">All Objects</div>
                         <div className="text-sm font-black text-slate-700 italic uppercase px-10 py-4">Audit Packages</div>
                         <div className="text-sm font-black text-slate-700 italic uppercase px-10 py-4">Tenant Assets</div>
                      </div>
                      <button className="bg-orange-500 text-white px-12 py-4 rounded-full font-black italic uppercase text-sm tracking-widest hover:bg-orange-400 transition-all shadow-3xl shadow-orange-500/20 active:scale-95">Upload to R2</button>
                   </div>
                   <div className="space-y-6 flex-1">
                      {objects.length > 0 ? objects.map((o: any, i: number) => (
                         <div key={i} className="flex justify-between items-center p-10 bg-slate-900/10 border border-white/5 rounded-[2.5rem] hover:bg-slate-950 transition-all group cursor-pointer active:scale-[0.99] border-l-[12px] border-l-slate-900 group-hover:border-l-orange-500 transition-all">
                            <div className="flex items-center gap-10">
                               <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-slate-700 group-hover:text-orange-500 group-hover:scale-110 transition-all"><FileText size={32}/></div>
                               <div>
                                  <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">{o.name}</h4>
                                  <p className="text-[11px] text-slate-700 font-black uppercase tracking-widest italic mt-1">Grid Anchor: {o.lead}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-16">
                               <span className="text-[11px] font-black text-slate-700 italic uppercase tracking-widest">{o.size} | PDF_NODE</span>
                               <ExternalLink size={28} className="text-slate-800 group-hover:text-orange-500 transition-all" />
                            </div>
                         </div>
                      )) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 py-32">
                             <HardDrive size={100} />
                             <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-8">No objects provisioned in vault</p>
                          </div>
                      )}
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'logs' && (
             <div className="space-y-16 animate-in fade-in duration-700">
                <header className="space-y-6">
                   <h2 className="text-9xl font-black text-white italic uppercase tracking-tighter leading-[0.8]">Security <span className="text-orange-500">Audit Log</span></h2>
                   <p className="text-slate-500 font-bold italic text-2xl">Real-time Infrastructure Event Trace for TenantBuilt.</p>
                </header>
                <div className="bg-slate-950 border border-white/10 p-16 rounded-[5rem] space-y-8 shadow-3xl font-mono">
                   <div className="flex justify-between items-center text-[11px] text-slate-700 font-black uppercase tracking-widest italic border-b border-white/5 pb-8 mb-4">
                      <span className="w-56">Grid Timestamp</span>
                      <span className="flex-1 px-12">Action Vector</span>
                      <span className="w-40 text-right">Protocol Code</span>
                   </div>
                   {[0,1,2,3,4,5,6,7,8,9].map(idx => (
                      <div key={idx} className="flex justify-between items-center text-sm py-6 border-b border-white/5 hover:bg-slate-900/40 transition-all px-8 rounded-3xl group cursor-crosshair">
                         <div className="flex items-center gap-6 w-56">
                            <div className="w-2 h-2 rounded-full bg-orange-500 group-hover:animate-pulse"></div>
                            <span className="text-slate-500 font-bold">2026.03.22 21:18:4{idx}</span>
                         </div>
                         <span className="text-white font-black italic uppercase flex-1 px-12 group-hover:text-orange-500 transition-colors">Event Node 00x{idx}: Security Sequence initiated on D1 Primary</span>
                         <span className="text-orange-500 font-black uppercase w-40 text-right tracking-[0.2em] group-hover:scale-110 transition-transform">OK_SYNC_200</span>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === 'contacts' && (
              <div className="space-y-20 animate-in fade-in duration-700">
                <header className="space-y-6">
                   <h2 className="text-9xl font-black text-white italic uppercase tracking-tighter leading-[0.8]">Identity <br/> <span className="text-orange-500">Network Matrix</span></h2>
                   <p className="text-slate-500 font-bold italic text-2xl">Aggregated Global Identity Node for Built Networks Ecosystem.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   {leads.map(l => (
                      <div key={l.id} className="bg-slate-950 border border-white/10 p-16 rounded-[5rem] shadow-3xl relative overflow-hidden group hover:border-orange-500/30 transition-all border-r-[20px] border-r-orange-500/5 hover:border-r-orange-500/20 duration-700">
                         <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:scale-150 transition-all duration-1000"><ShieldCheck className="text-orange-500" size={200}/></div>
                         <div className="flex justify-between items-center border-b border-white/5 pb-12 mb-12 relative z-10">
                            <div>
                               <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{l.company_name}</h3>
                               <div className="flex items-center gap-3 mt-4">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest italic leading-none">Node Signal Active</p>
                               </div>
                            </div>
                            <Link to={`/lead/${l.id}`} className="w-16 h-16 bg-slate-900 border border-white/10 rounded-3xl flex items-center justify-center text-slate-700 hover:text-white hover:border-orange-500/40 transition-all active:scale-95 shadow-2xl"><ChevronRight size={40}/></Link>
                         </div>
                         <div className="text-center py-16 relative z-10 space-y-8">
                            <Users size={100} className="mx-auto text-slate-900 group-hover:text-slate-800 transition-colors" />
                            <div>
                               <p className="text-sm text-slate-700 font-black uppercase italic tracking-[0.3em]">No primary Identities provisioned yet</p>
                               <p className="text-[10px] text-slate-800 font-bold italic mt-2">D1 Record: identity_fabric is empty for this node_key</p>
                            </div>
                            <button className="bg-slate-900 text-orange-500 border border-orange-500/20 px-12 py-4 rounded-full text-xs font-black uppercase italic hover:bg-orange-500 hover:text-white transition-all shadow-3xl">Provision Human Intel</button>
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

function SideNavItem({ icon, label, active, onClick }: any) {
    return (
        <div 
            onClick={onClick}
            className={`flex items-center gap-6 px-8 py-5 rounded-[2.5rem] cursor-pointer transition-all duration-300 group border-2 ${active ? 'bg-orange-500/10 border-orange-500/30 text-white shadow-[0_0_40px_rgba(249,115,22,0.1)]' : 'border-transparent text-slate-700 hover:text-slate-300 hover:bg-slate-900/40'}`}
        >
            <div className={`transition-all ${active ? 'text-orange-500' : 'group-hover:text-orange-500/50'}`}>
                {icon}
            </div>
            <span className="font-black italic uppercase text-xs tracking-[0.2em] whitespace-nowrap">{label}</span>
            {active && <div className="ml-auto w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,1)] animate-pulse"></div>}
        </div>
    );
}

function StatCard({ count, label, active }: any) {
  return (
    <div className={`bg-slate-950 border p-12 rounded-[5rem] shadow-4xl relative group overflow-hidden ${active ? 'border-orange-500/30' : 'border-white/5 hover:border-orange-500/10'} transition-all active:scale-95 duration-500`}>
       {active && <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-opacity group-hover:scale-110 duration-1000"><DollarSign className="text-orange-500" size={160}/></div>}
       <div className={`text-8xl font-black italic mb-4 tracking-tighter leading-none ${active ? 'text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'text-white'}`}>{count || 0}</div>
       <div className="text-[11px] text-slate-700 uppercase font-black tracking-[0.5em] italic leading-none">{label}</div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Search, Target, Zap, RefreshCw, 
  ExternalLink, AlertCircle, ShieldCheck, 
  TrendingUp, MapPin, Wifi, Database, 
  FolderLock, LayoutGrid, Settings, Terminal,
  Plus, Eye
} from 'lucide-react';

const API_BASE = 'https://cloudbase-crm.curtislamasters.workers.dev/api';

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('leads'); // leads, schema, storage
  const [isHunting, setIsHunting] = useState(false);
  const [niche, setNiche] = useState('Law Firms');
  const [location, setLocation] = useState('Creston, IA');
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState('disconnected');
  
  // Parity State
  const [collections, setCollections] = useState<any[]>([]);

  const fetchLeads = async () => {
    const token = localStorage.getItem('cb_token');
    try {
      const res = await fetch(`${API_BASE}/leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
    } catch (err) {
      console.error("Failed to fetch leads", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchema = async () => {
    const token = localStorage.getItem('cb_token');
    const res = await fetch(`${API_BASE}/schema/collections`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setCollections(data.tables || []);
  };

  useEffect(() => {
    fetchLeads();
    fetchSchema();
    
    const token = localStorage.getItem('cb_token');
    if (token) {
      const sse = new EventSource(`${API_BASE}/realtime/leads?token=${token}`);
      sse.onopen = () => setRealtimeStatus('connected');
      sse.onerror = () => setRealtimeStatus('error');
      sse.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'update') fetchLeads();
      };
      return () => sse.close();
    }
  }, []);

  const handleHunt = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsHunting(true);
    const token = localStorage.getItem('cb_token');
    await fetch(`${API_BASE}/hunter/trigger`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, location })
    });
    setIsHunting(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex font-sans selection:bg-orange-500/30 overflow-hidden">
      
      {/* 1. Command Rail (PocketBase Parity UI) */}
      <aside className="w-20 bg-slate-950 border-r border-white/5 flex flex-col items-center py-8 gap-10">
         <div className="bg-orange-500 p-3 rounded-2xl shadow-2xl shadow-orange-500/30 active:scale-95 transition-all">
            <ShieldCheck size={28} className="text-white" />
         </div>
         
         <div className="flex flex-col gap-6 flex-1">
             <RailIcon icon={<LayoutGrid size={22}/>} active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} label="CRM" />
             <RailIcon icon={<Database size={22}/>} active={activeTab === 'schema'} onClick={() => setActiveTab('schema')} label="Schema" />
             <RailIcon icon={<FolderLock size={22}/>} active={activeTab === 'storage'} onClick={() => setActiveTab('storage')} label="Vault" />
             <RailIcon icon={<Terminal size={22}/>} active={false} onClick={() => {}} label="Logs" />
         </div>

         <div className="flex flex-col gap-6">
            <RailIcon icon={<Settings size={22}/>} active={false} onClick={() => {}} label="Settings" />
         </div>
      </aside>

      {/* 2. Main Terminal */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <nav className="border-b border-white/5 bg-slate-900/10 backdrop-blur-3xl px-12 py-6 sticky top-0 z-50 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black text-white tracking-widest uppercase italic">CLOUDBASE <span className="text-orange-500">OP-CENTER</span></h1>
              <div className="flex items-center gap-2 mt-1">
                 <div className={`w-1.5 h-1.5 rounded-full ${realtimeStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                 <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em]">{realtimeStatus === 'connected' ? 'Grid Securely Synced' : 'Grid Link Lost'}</p>
              </div>
            </div>
            <div className="flex items-center gap-8">
               <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-600 font-extrabold uppercase">Active Tenant</span>
                  <span className="text-xs text-white font-bold italic">Built Networks (msp-flavor)</span>
               </div>
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-white/10"></div>
            </div>
        </nav>

        <main className="p-12 space-y-12 max-w-7xl mx-auto w-full">
          
          {activeTab === 'leads' && (
            <>
              {/* Hunter Section */}
              <section className="bg-slate-900/20 border border-white/5 rounded-[3rem] p-12 relative overflow-hidden group hover:border-orange-500/20 transition-all duration-700">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 blur-[120px] pointer-events-none rounded-full group-hover:bg-orange-500/10 transition-all duration-1000"></div>
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-16">
                  <div className="max-w-xl">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] mb-4 block">Engine v3.14 (Iowa Grid)</span>
                    <h2 className="text-5xl font-black text-white leading-tight mb-6 italic tracking-tighter">Harvest <span className="text-orange-500">Technically Deficient</span> Leads</h2>
                    <p className="text-slate-400 text-lg leading-relaxed font-medium">Llama 3.1 autonomously audits Creston and local Iowa businesses for SSL liability and performance debt.</p>
                  </div>
                  <form onSubmit={handleHunt} className="w-full lg:max-w-md bg-slate-950/60 p-2.5 border border-white/10 rounded-[2.5rem] flex flex-col gap-2">
                    <div className="flex-1 relative">
                       <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" />
                       <input value={niche} onChange={e => setNiche(e.target.value)} className="w-full bg-transparent border-none text-white pl-14 pr-4 py-4 focus:ring-0 text-sm font-bold" placeholder="Niche (e.g. Lawyers)" />
                    </div>
                    <div className="flex-1 relative">
                       <MapPin size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" />
                       <input value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-transparent border-none text-white pl-14 pr-4 py-4 focus:ring-0 text-sm font-bold" placeholder="Creston, IA" />
                    </div>
                    <button disabled={isHunting} className="bg-orange-500 text-white font-black py-4 rounded-[1.8rem] hover:bg-orange-600 disabled:bg-slate-800 transition-all flex items-center justify-center gap-3">
                      {isHunting ? <RefreshCw className="animate-spin" size={20}/> : <Target size={20}/>}
                      {isHunting ? 'INITIATING SCAN...' : 'LAUNCH HUNTER'}
                    </button>
                  </form>
                </div>
              </section>

              {/* Feed Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-32">
                {leads.map(lead => (
                  <Link to={`/lead/${lead.id}`} key={lead.id} className="group bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] hover:border-orange-500/40 transition-all relative overflow-hidden h-64 flex flex-col justify-between">
                    <div className="absolute top-0 right-0 p-8 text-right">
                       <div className={`text-4xl font-black italic ${lead.ai_score > 80 ? 'text-red-500' : 'text-orange-500'}`}>{lead.ai_score}</div>
                       <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Debt Index</div>
                    </div>
                    <div className="flex gap-6">
                       <div className="w-16 h-16 rounded-3xl bg-slate-950 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                          <Users className="text-orange-500" size={28}/>
                       </div>
                       <div>
                          <h4 className="text-2xl font-black text-white italic group-hover:text-orange-500 transition-colors uppercase tracking-tighter">{lead.company_name}</h4>
                          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1 flex items-center gap-2"><Wifi size={12}/> {lead.website_url.replace('https://', '')}</p>
                       </div>
                    </div>
                    <div className="flex justify-between items-end border-t border-white/5 pt-6">
                       <div className="flex gap-4">
                          <div className="flex flex-col">
                             <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Status</span>
                             <span className="text-[10px] text-white font-bold px-3 py-1 bg-slate-950 border border-white/5 rounded-full uppercase italic">{lead.status}</span>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">SSL State</span>
                             <span className={`text-[10px] font-black uppercase ${lead.technical_stack?.includes('SSL:OK') ? 'text-green-500' : 'text-red-500'}`}>{lead.technical_stack?.split('|')[1]?.trim() || 'INSECURE'}</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500 font-black text-[10px] uppercase italic tracking-[0.2em]">Open Dossier <Plus size={14}/></div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-12 animate-in fade-in duration-700">
               <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Infinite <span className="text-orange-500">Schemas</span></h2>
                    <p className="text-slate-500 font-bold">PocketBase Parity: Edge-Native Dynamic Collections</p>
                  </div>
                  <button className="bg-white text-black font-black px-8 py-3 rounded-2xl flex items-center gap-3 hover:bg-orange-500 hover:text-white transition-all">
                     <Plus size={20}/> NEW COLLECTION
                  </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {collections.map((col: any) => (
                   <div key={col.name} className="bg-slate-900/30 border border-white/10 p-8 rounded-[2rem] hover:bg-slate-900/50 transition-all group">
                      <div className="flex justify-between items-start mb-6">
                         <div className="p-4 bg-slate-950 rounded-2xl border border-orange-500/20 text-orange-500 group-hover:scale-110 transition-transform">
                            <Database size={24}/>
                         </div>
                         <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Type: Permanent</div>
                      </div>
                      <h3 className="text-xl font-bold text-white uppercase italic mb-2 tracking-tight">{col.name}</h3>
                      <p className="text-slate-500 text-xs font-medium mb-6">Managed SQL Table in Iowa-Grid</p>
                      <div className="flex justify-between items-center border-t border-white/5 pt-6 mt-6">
                         <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Active Schema</span>
                         <button className="text-white hover:text-orange-500 transition-colors"><Eye size={18}/></button>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'storage' && (
            <div className="text-center p-20 space-y-6">
               <div className="inline-block p-10 bg-slate-950 border border-white/5 rounded-full text-orange-500 shadow-2xl shadow-orange-500/10">
                  <FolderLock size={64}/>
               </div>
               <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Secure <span className="text-orange-500">R2 Object Vault</span></h2>
               <p className="text-slate-500 max-w-sm mx-auto font-medium">Multi-tenant encrypted file storage with sub-millisecond access via Cloudflare Edge.</p>
               <button className="bg-slate-900 border border-white/5 text-slate-400 font-black px-10 py-4 rounded-3xl hover:bg-slate-800 transition-all">ENABLE AUTO-BUCKETS</button>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

function RailIcon({ icon, active, onClick, label }: { icon: any, active: boolean, onClick: () => void, label: string }) {
  return (
    <div 
      onClick={onClick}
      className={`relative group cursor-pointer p-3 rounded-2xl transition-all duration-300 ${active ? 'bg-orange-500/10 text-orange-500 shadow-2xl shadow-orange-500/10' : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'}`}
    >
       {icon}
       <span className="absolute left-full ml-4 bg-slate-950 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-[100] whitespace-nowrap shadow-2xl">
          {label}
       </span>
       {active && <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-full"></div>}
    </div>
  );
}
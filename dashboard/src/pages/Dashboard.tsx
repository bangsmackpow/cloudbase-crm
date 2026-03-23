import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Search, Target, Zap, RefreshCw, 
  ShieldCheck, LayoutGrid, Database, FolderLock, 
  Clock, CheckSquare, Plus, DollarSign, TrendingUp,
  FileText, Activity, HardDrive, Trash2, ExternalLink,
  ChevronRight, BarChart3, Info, X, Globe, Sun, Moon, Monitor, Settings,
  Kanban, BookOpen, PieChart, Mail, Briefcase, PlusCircle, AlertCircle, LogOut
} from 'lucide-react';

const API_BASE = 'https://cloudbase-crm.curtislamasters.workers.dev/api';

const TEMPLATES = [
  { id: 'legal', name: 'Law Firms', niche: 'Legal Partners', audit: 'Legacy Tech & SSL' },
  { id: 'dental', name: 'Healthcare', niche: 'Dental Clinics', audit: 'HIPAA & Latency' },
  { id: 'trades', name: 'Home Services', niche: 'Plumbing/HVAC', audit: 'SEO & Mobile' },
];

export default function Dashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [crmStats, setCrmStats] = useState({ revenue: 0, pipe_value: 0, won_count: 0 });
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('crm'); 
  const [isHunting, setIsHunting] = useState(false);
  const [huntResult, setHuntResult] = useState<any>(null);
  const [realtimeStatus, setRealtimeStatus] = useState('disconnected');
  const [huntParams, setHuntParams] = useState({ niche: 'Law Firms', location: 'Creston, IA' });
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [viewMode, setViewMode] = useState('list'); 
  
  const [collections, setCollections] = useState<any[]>([]);
  const [objects, setObjects] = useState<any[]>([]);
  const [dashboardUsers, setDashboardUsers] = useState<any[]>([]);
  
  const navigate = useNavigate();
  const logoutRef = useRef(false);

  // Modals
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ company_name: '', website_url: '', status: 'New' });

  const logout = useCallback(() => {
    if (logoutRef.current) return;
    logoutRef.current = true;
    console.log('[AUTH] Logging out...');
    localStorage.removeItem('cb_token');
    navigate('/login');
  }, [navigate]);

  // Decode JWT manually (Fixes atob issues with URL-safe base64)
  const decodeJWT = (token: string) => {
      try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          return JSON.parse(jsonPayload);
      } catch (e) {
          return null;
      }
  };

  // Token Decoding & Initialization
  useEffect(() => {
    const token = localStorage.getItem('cb_token');
    if (token) {
        const payload = decodeJWT(token);
        if (payload) {
            setUser(payload);
        } else {
            console.error('Invalid token payload');
            logout();
        }
    } else {
        navigate('/login');
    }
  }, [logout, navigate]);

  // Theme Handling
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', systemDark);
    } else {
        root.classList.toggle('dark', theme === 'dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('cb_token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const results = await Promise.all([
        fetch(`${API_BASE}/leads`, { headers }),
        fetch(`${API_BASE}/crm/tasks`, { headers }),
        fetch(`${API_BASE}/crm/stats`, { headers })
      ]);
      
      const unauth = results.find(r => r.status === 401);
      if (unauth) {
          console.warn('[AUTH] Forbidden/Unauthorized response. Triggering logout.');
          logout();
          return;
      }
      
      const [lRes, tRes, sRes] = results;
      if (lRes.ok) setLeads(await lRes.json());
      if (tRes.ok) setTasks(await tRes.json());
      if (sRes.ok) setCrmStats(await sRes.json());
    } catch (err) { 
        console.error('Fetch Error', err); 
    }
  }, [logout]);

  const updateLeadStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem('cb_token');
    try {
        const res = await fetch(`${API_BASE}/crm/leads/${id}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.status === 401) logout();
        fetchData();
    } catch (e) {}
  };

  const manualAddLead = async () => {
    const token = localStorage.getItem('cb_token');
    try {
        const res = await fetch(`${API_BASE}/crm/leads`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(newLead)
        });
        if (res.ok) {
            setIsAddLeadModalOpen(false);
            setNewLead({ company_name: '', website_url: '', status: 'New' });
            fetchData();
        }
    } catch (e) {}
  };

  const fetchBaaSData = useCallback(async (tab: string) => {
    const token = localStorage.getItem('cb_token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      if (tab === 'schema') {
        const res = await fetch(`${API_BASE}/schema/collections`, { headers });
        if (res.ok) {
            const d = await res.json();
            setCollections(d.tables || []);
        }
      }
      if (tab === 'storage') {
          const res = await fetch(`${API_BASE}/leads`, { headers });
          if (res.ok) {
              const d = await res.json();
              setObjects(d.map((l: any) => ({ name: `audit_${l.id.slice(0,4)}.pdf`, size: '1.2MB', lead: l.company_name, id: l.id })));
          }
      }
      if (tab === 'users') {
          const res = await fetch(`${API_BASE}/auth/users`, { headers });
          if (res.ok) setDashboardUsers(await res.json());
      }
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('cb_token');
    if (token) {
      fetchData();
      const sse = new EventSource(`${API_BASE}/realtime/leads?token=${token}`);
      sse.onopen = () => setRealtimeStatus('connected');
      sse.onmessage = () => fetchData();
      sse.onerror = () => setRealtimeStatus('disconnected');
      return () => sse.close();
    }
  }, [fetchData]);

  useEffect(() => {
      if (activeTab !== 'crm' && activeTab !== 'email' && activeTab !== 'reports' && activeTab !== 'contacts') {
          fetchBaaSData(activeTab);
      }
  }, [activeTab, fetchBaaSData]);

  const triggerHunt = async () => {
    setIsHunting(true);
    setHuntResult(null);
    const token = localStorage.getItem('cb_token');
    try {
        const res = await fetch(`${API_BASE}/hunter/trigger`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(huntParams)
        });
        
        if (res.status === 401) {
            logout();
            return;
        }

        const d = await res.json();
        if (res.ok) {
            setHuntResult(d);
            fetchData();
        } else {
            setHuntResult({ error: d.error || "Execution failed." });
        }
    } catch (err) { 
        setHuntResult({ error: "Network fault. Check Workers connectivity." });
    }
    finally { setIsHunting(false); }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-background flex font-sans selection:bg-orange-500/30 overflow-hidden text-foreground">
      
      {/* 🛡️ Sidebar (Role-Aware) */}
      <aside className="w-64 bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 flex flex-col p-6 z-[60] transition-all">
         <div className="flex items-center gap-3 mb-10 pl-2">
            <div className="bg-orange-500 p-2.5 rounded-xl shadow-xl shadow-orange-500/10">
               <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
               <h2 className="text-base font-black italic leading-none">CLOUDBASE</h2>
               <p className="text-[8px] text-orange-500 font-bold uppercase tracking-[0.2em] mt-1">Grid Ops v4.8</p>
            </div>
         </div>

         <nav className="flex flex-col gap-1 flex-1">
             <SideNavItem icon={<LayoutGrid size={16}/>} label="Dashboard" active={activeTab === 'crm'} onClick={() => setActiveTab('crm')} />
             <SideNavItem icon={<Users size={16}/>} label="Identities" active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
             <SideNavItem icon={<PieChart size={16}/>} label="Analytics" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
             <SideNavItem icon={<Mail size={16}/>} label="Messaging" active={activeTab === 'email'} onClick={() => setActiveTab('email')} />
             
             {isAdmin && (
                <>
                   <div className="mt-8 mb-2 text-[8px] text-slate-400 dark:text-slate-700 font-bold uppercase tracking-[0.4em] italic pl-4">Admin Core</div>
                   <SideNavItem icon={<Database size={16}/>} label="D1 Schema" active={activeTab === 'schema'} onClick={() => setActiveTab('schema')} />
                   <SideNavItem icon={<FolderLock size={16}/>} label="R2 Vault" active={activeTab === 'storage'} onClick={() => setActiveTab('storage')} />
                   <SideNavItem icon={<Users size={16}/>} label="Staff Ops" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                   <SideNavItem icon={<Activity size={16}/>} label="Grid Trace" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
                </>
             )}
         </nav>

         <div className="pt-6 border-t border-slate-200 dark:border-white/5 space-y-4">
            <div className="bg-slate-200 dark:bg-slate-900/50 p-1.5 rounded-xl flex justify-between">
                <ThemeBtn active={theme === 'light'} onClick={() => setTheme('light')} icon={<Sun size={12}/>}/>
                <ThemeBtn active={theme === 'dark'} onClick={() => setTheme('dark')} icon={<Moon size={12}/>}/>
                <ThemeBtn active={theme === 'system'} onClick={() => setTheme('system')} icon={<Monitor size={12}/>}/>
            </div>
            <div className="p-3 rounded-xl flex flex-col gap-2 bg-slate-200 dark:bg-slate-900/40 border border-white/5">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-black text-[10px] italic">{user?.email?.slice(0,1).toUpperCase() || 'U'}</div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                     <div className="text-[10px] font-black italic uppercase tracking-tighter truncate">{user?.email?.split('@')[0]}</div>
                     <div className="text-[8px] text-orange-500 font-bold uppercase leading-none">{user?.role || 'Staff'}</div>
                  </div>
                  <button onClick={logout} className="text-slate-500 hover:text-red-500 transition-colors"><LogOut size={13}/></button>
               </div>
            </div>
         </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <nav className="border-b border-slate-200 dark:border-white/5 bg-background/50 backdrop-blur-xl px-10 py-5 sticky top-0 z-50 flex justify-between items-center">
            <h1 className="text-base font-black tracking-widest uppercase italic leading-none">GRID <span className="text-orange-500">OP-CENTER</span></h1>
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${realtimeStatus === 'connected' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{realtimeStatus === 'connected' ? 'Realtime On' : 'Grid Waiting...'}</p>
            </div>
        </nav>

        <main className="p-10 space-y-10 max-w-7xl mx-auto w-full pb-32">
          
          {activeTab === 'crm' && (
            <div className="space-y-12 animate-in fade-in duration-300">
              
              {/* Hunter Engine + Templates */}
              <section className="bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] pointer-events-none group-hover:bg-orange-500/10 transition-all duration-1000"></div>
                 <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-8 space-y-6">
                       <div className="flex items-center gap-4">
                          <span className="bg-orange-500/20 text-orange-500 text-[9px] font-black px-3 py-1 rounded-full italic border border-orange-500/20">GRID SCOUT v4.8</span>
                          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Automate <span className="text-orange-500">Pipeline</span></h2>
                       </div>
                       <div className="flex gap-2 flex-wrap">
                          {TEMPLATES.map(t => (
                             <button key={t.id} onClick={() => setHuntParams({ niche: t.niche, location: 'Creston, IA' })} className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl text-[9px] font-black italic uppercase hover:text-orange-500 hover:border-orange-500/30 transition-all">{t.name}</button>
                          ))}
                       </div>
                       <div className="flex gap-3">
                          <input value={huntParams.niche} onChange={e => setHuntParams({...huntParams, niche: e.target.value})} className="flex-1 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-xl p-3 text-[11px] font-black italic uppercase text-foreground" placeholder="NICHE" />
                          <input value={huntParams.location} onChange={e => setHuntParams({...huntParams, location: e.target.value})} className="flex-1 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-xl p-3 text-[11px] font-black italic uppercase text-foreground" placeholder="LOCATION" />
                          <button disabled={isHunting} onClick={triggerHunt} className={`px-10 py-3 rounded-xl font-black italic text-[11px] flex items-center gap-2 group ${isHunting ? 'bg-slate-200 dark:bg-slate-800 cursor-not-allowed' : 'bg-orange-500 text-white active:scale-95 transition-all shadow-xl shadow-orange-500/20'}`}>
                             {isHunting ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={15} className="group-hover:translate-y-[-2px] transition-transform" /> } 
                             {isHunting ? 'SCANNING' : 'INITIATE'}
                          </button>
                       </div>
                       {huntResult && (
                           <div className={`p-4 rounded-xl text-[10px] font-black italic uppercase flex items-center gap-3 animate-in slide-in-from-top-4 ${huntResult.error ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                              {huntResult.error ? <AlertCircle size={14}/> : <ShieldCheck size={14}/>}
                              {huntResult.error || `Successfully Provisioned ${huntResult.added_leads || 0} Nodes.`}
                           </div>
                       )}
                    </div>
                    <div className="md:col-span-4 flex flex-col items-center justify-center border-l border-slate-100 dark:border-white/5 py-8">
                       <span className="text-7xl font-black italic tracking-tighter text-foreground mb-1">{leads.length}</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Global Nodes</span>
                    </div>
                 </div>
              </section>

              {/* View Selector + Add Lead */}
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-4">
                 <div className="flex gap-8">
                    <button onClick={() => setViewMode('list')} className={`text-[11px] font-black uppercase italic tracking-widest flex items-center gap-2 p-2 relative ${viewMode === 'list' ? 'text-orange-500' : 'text-slate-500'}`}>
                       <LayoutGrid size={15}/> List
                       {viewMode === 'list' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-full"></div>}
                    </button>
                    <button onClick={() => setViewMode('kanban')} className={`text-[11px] font-black uppercase italic tracking-widest flex items-center gap-2 p-2 relative ${viewMode === 'kanban' ? 'text-orange-500' : 'text-slate-500'}`}>
                       <Kanban size={15}/> Pipeline
                       {viewMode === 'kanban' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 rounded-full"></div>}
                    </button>
                 </div>
                 <button onClick={() => setIsAddLeadModalOpen(true)} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-6 py-2.5 rounded-xl text-[10px] font-black italic uppercase hover:border-orange-500/40 transition-all active:scale-95 shadow-lg shadow-black/5">
                    <PlusCircle size={15} className="text-orange-500" /> Manual Entry
                 </button>
              </div>

              {viewMode === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {leads.map(l => <LeadCard key={l.id} lead={l} />)}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-6 items-start">
                   <KanbanCol title="Inbound" leads={leads.filter(l => l.status === 'Hunter-AI' || l.status === 'New')} status="New" onDrop={updateLeadStatus} />
                   <KanbanCol title="Contacted" leads={leads.filter(l => l.status === 'Contacted')} status="Contacted" onDrop={updateLeadStatus} />
                   <KanbanCol title="Closing" leads={leads.filter(l => l.status === 'Proposal')} status="Proposal" onDrop={updateLeadStatus} />
                   <KanbanCol title="Won" leads={leads.filter(l => l.status === 'Won')} status="Won" onDrop={updateLeadStatus} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'contacts' && (
              <div className="space-y-12 animate-in fade-in duration-300">
                  <header>
                      <h2 className="text-5xl font-black italic tracking-tighter uppercase underline decoration-orange-500/30 underline-offset-[16px]">Identity <span className="text-orange-500">Fabric</span></h2>
                      <p className="text-slate-500 text-sm font-bold italic opacity-60">Phase IV: Global Node Identity Matrix.</p>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {leads.map(l => (
                        <div key={l.id} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 p-8 rounded-[2.5rem] shadow-xl group hover:border-orange-500/40 transition-all relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-all">
                                <Users size={120} className="text-orange-500" />
                             </div>
                             <div className="flex justify-between items-start mb-10 relative z-10">
                                <div>
                                    <h4 className="text-2xl font-black italic uppercase tracking-tighter truncate w-64">{l.company_name}</h4>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">{l.website_url}</div>
                                </div>
                                <div className="text-orange-500 font-black italic text-2xl">#{l.ai_score}</div>
                             </div>
                             <div className="space-y-4 relative z-10">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-white/5 flex items-center justify-between group/item">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-950 flex items-center justify-center text-slate-500"><Users size={14}/></div>
                                        <div className="text-[11px] font-black italic uppercase text-slate-400 group-hover/item:text-orange-500">Global Admin</div>
                                    </div>
                                    <button className="text-[9px] font-bold text-slate-600 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg">PROVISION</button>
                                </div>
                             </div>
                             <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 flex justify-between relative z-10">
                                <span className={`text-[9px] font-black uppercase italic ${l.status === 'Won' ? 'text-green-500' : 'text-slate-500 opacity-40'}`}>Status: {l.status}</span>
                                <Link to={`/lead/${l.id}`} className="text-orange-500 text-[10px] font-black italic uppercase flex items-center gap-2 group-hover:translate-x-1 transition-transform">Inspect Node <ChevronRight size={14}/></Link>
                             </div>
                        </div>
                    ))}
                  </div>
              </div>
          )}

          {activeTab === 'reports' && (
              <div className="space-y-12 animate-in fade-in duration-300">
                  <header>
                      <h2 className="text-5xl font-black italic tracking-tighter uppercase">Intelligence <span className="text-orange-500">Audit Reports</span></h2>
                      <p className="text-slate-500 text-sm font-bold italic opacity-60">Phase III: Strategic Reporting Grid.</p>
                  </header>
                  <div className="grid grid-cols-3 gap-8">
                      <ReportCard title="Sales Pipeline" val={`$${crmStats.pipe_value?.toLocaleString()}`} trend="+12% this week" icon={<TrendingUp size={32}/>} />
                      <ReportCard title="Infrastructure Scouted" val={leads.length} trend="Total Nodes" icon={<Search size={32}/>} />
                      <ReportCard title="Grid Conversion" val={`${((crmStats.won_count / (leads.length || 1)) * 100).toFixed(1)}%`} trend="Win Rate" icon={<DollarSign size={32}/>} />
                  </div>
              </div>
          )}

          {activeTab === 'users' && isAdmin && (
            <div className="space-y-12 animate-in fade-in duration-300">
                <header className="flex justify-between items-end">
                    <div>
                        <h2 className="text-6xl font-black italic uppercase tracking-tighter">Staff <span className="text-orange-500">Manager</span></h2>
                        <p className="text-slate-500 text-sm font-bold italic opacity-60">Provision credentials and permission rings.</p>
                    </div>
                </header>

                <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[3rem] p-10 shadow-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5">
                                <th className="pb-6 text-[10px] font-black uppercase italic text-slate-400 tracking-widest">Identity Node</th>
                                <th className="pb-6 text-[10px] font-black uppercase italic text-slate-400 tracking-widest">Access Ring</th>
                                <th className="pb-6 text-[10px] font-black uppercase italic text-slate-400 tracking-widest">Created</th>
                                <th className="pb-6 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {dashboardUsers.map((u: any) => (
                                <tr key={u.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                                    <td className="py-7">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-orange-500 font-black italic border border-white/5">{u.email?.slice(0,1).toUpperCase() || 'U'}</div>
                                            <div>
                                                <div className="text-base font-black italic uppercase tracking-tighter text-foreground">{u.email}</div>
                                                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.3em]">{u.id.slice(0,12)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-7">
                                        <span className={`px-5 py-2 rounded-xl text-[9px] font-black italic uppercase tracking-widest border border-white/5 ${u.role === 'admin' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>{u.role}</span>
                                    </td>
                                    <td className="py-7 font-black italic text-xs opacity-40 uppercase tracking-tighter">{u.created_at?.split('T')[0]}</td>
                                    <td className="py-7 text-right">
                                        <button className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-red-500 hover:text-white transition-all border border-white/5"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          )}

          {/* New Lead Modal */}
          {isAddLeadModalOpen && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-3xl animate-in fade-in">
                <div className="bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-white/5 p-12 rounded-[3.5rem] shadow-2xl w-full max-w-lg space-y-8 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-150 transition-all duration-1000">
                      <PlusCircle size={200} className="text-orange-500" />
                   </div>
                   <header className="space-y-2">
                       <h3 className="text-4xl font-black italic uppercase tracking-tighter">Manual <span className="text-orange-500">Provision</span></h3>
                       <p className="text-slate-500 text-[10px] font-black italic uppercase opacity-60">Inject a lead directly into the D1 pipeline.</p>
                   </header>
                   <div className="space-y-4">
                      <Input label="Company Name" value={newLead.company_name} onChange={(v: string) => setNewLead({...newLead, company_name: v})} />
                      <Input label="Website / Domain" value={newLead.website_url} onChange={(v: string) => setNewLead({...newLead, website_url: v})} />
                      <div className="flex flex-col gap-2">
                         <span className="text-[10px] font-black uppercase italic text-slate-500 tracking-widest ml-1">Initial Stage</span>
                         <select 
                            className="bg-slate-100 dark:bg-slate-900 border-2 border-white/10 p-5 rounded-2xl w-full text-xs font-black italic uppercase appearance-none outline-none focus:border-orange-500 transition-all shadow-inner"
                            value={newLead.status} onChange={e => setNewLead({...newLead, status: e.target.value})}
                         >
                            <option value="New">Inbound / Discovery</option>
                            <option value="Contacted">In-Talks</option>
                            <option value="Won">Won Deals</option>
                         </select>
                      </div>
                   </div>
                   <div className="flex gap-4 pt-6">
                      <button onClick={() => setIsAddLeadModalOpen(false)} className="flex-1 py-4 rounded-2xl text-[10px] font-black italic uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-all">Abort</button>
                      <button onClick={manualAddLead} className="flex-1 py-5 bg-orange-500 text-white rounded-2xl text-[10px] font-black italic uppercase tracking-widest shadow-2xl shadow-orange-500/20 active:scale-95 transition-all">Finalize Node</button>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'email' && (
              <div className="space-y-12 animate-in fade-in duration-300">
                  <header>
                      <h2 className="text-5xl font-black italic tracking-tighter uppercase underline decoration-orange-500/30 underline-offset-[16px]">Messaging <span className="text-orange-500">Hub</span></h2>
                      <p className="text-slate-500 text-sm font-bold italic opacity-60">Phase V: Automated Outreach Center.</p>
                  </header>
                  <div className="bg-slate-100 dark:bg-slate-950/40 border border-white/5 rounded-[3rem] p-12 text-center space-y-6">
                      <Mail size={80} className="mx-auto text-orange-500 opacity-20" />
                      <h3 className="text-3xl font-black italic uppercase tracking-tighter">Outreach Protocol Offline</h3>
                      <p className="max-w-md mx-auto text-xs font-bold text-slate-500 uppercase italic leading-loose opacity-60">You have no active Email Workers configured. Integrate Mailgun or Cloudflare Email to begin automated security audit outreach.</p>
                      <button className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black italic uppercase text-xs shadow-xl active:scale-95">Link Email Provider</button>
                  </div>
              </div>
          )}

          {isAdmin && (activeTab === 'schema' || activeTab === 'storage' || activeTab === 'logs') && (
              <div className="space-y-12 animate-in fade-in duration-300">
                  <h2 className="text-5xl font-black italic tracking-tighter uppercase">Infrastructure <span className="text-orange-500">{activeTab}</span></h2>
                  <div className="bg-slate-100 dark:bg-slate-950 p-10 rounded-[3rem] min-h-[400px]">
                      {activeTab === 'schema' && collections.map(t => (
                          <div key={t.name} className="p-6 border-b border-white/5 flex justify-between items-center group cursor-pointer hover:bg-white/5 transition-all">
                              <span className="text-xl font-black italic uppercase">{t.name}</span>
                              <ChevronRight className="text-orange-500" />
                          </div>
                      ))}
                      {activeTab === 'storage' && objects.map(o => (
                          <div key={o.id} className="p-6 border-b border-white/5 flex justify-between items-center group cursor-pointer hover:bg-white/5 transition-all">
                             <div className="flex items-center gap-4">
                                <FileText size={20} className="text-slate-500 group-hover:text-orange-500" />
                                <span className="text-lg font-black italic uppercase">{o.name}</span>
                             </div>
                             <span className="text-[9px] font-black uppercase text-slate-800">{o.size}</span>
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
            className={`flex items-center gap-4 px-5 py-4 rounded-xl cursor-pointer transition-all duration-300 group border-2 ${active ? 'bg-orange-500/10 border-orange-500/30 text-foreground shadow-lg' : 'border-transparent text-slate-400 dark:text-slate-800 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-900/30'}`}
        >
            <div className={`${active ? 'text-orange-500' : 'group-hover:text-orange-500/50'}`}>
                {icon}
            </div>
            <span className="font-black italic uppercase text-[10px] tracking-[0.2em] whitespace-nowrap">{label}</span>
        </div>
    );
}

function ThemeBtn({ active, onClick, icon }: any) {
    return (
        <button onClick={onClick} className={`flex-1 p-2 rounded-lg flex items-center justify-center transition-all ${active ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-md border border-white/5' : 'text-slate-400 hover:text-white'}`}>
            {icon}
        </button>
    );
}

function LeadCard({ lead }: { lead: any }) {
    return (
        <Link to={`/lead/${lead.id}`} className="group bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/10 rounded-[2.5rem] p-7 hover:border-orange-500/40 transition-all h-64 flex flex-col justify-between shadow-xl active:scale-95 duration-200 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-5 group-hover:scale-150 transition-all duration-700">
               <ShieldCheck size={200} className="text-orange-500" />
            </div>
            <div className="flex justify-between items-start relative z-10">
               <div className={`text-5xl font-black italic tracking-tighter ${lead.ai_score > 80 ? 'text-red-500' : 'text-orange-500'}`}>{lead.ai_score}</div>
               <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-center text-orange-500 border border-slate-200 dark:border-white/5 group-hover:bg-orange-500 group-hover:text-white transition-all"><Target size={20}/></div>
            </div>
            <div className="relative z-10">
               <h4 className="text-2xl font-black italic uppercase tracking-tighter leading-tight line-clamp-1">{lead.company_name}</h4>
               <p className="text-slate-500 text-[10px] font-bold italic opacity-60 uppercase mt-1 tracking-wider">{lead.website_url?.replace('https://', '')}</p>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-5 relative z-10">
               <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-full text-[9px] font-black uppercase text-slate-500 border border-white/5">{lead.status || 'New'}</span>
               <ChevronRight size={22} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    );
}

function KanbanCol({ title, leads, status, onDrop }: any) {
    const handleDragOver = (e: any) => e.preventDefault();
    const handleDrop = (e: any) => {
        const id = e.dataTransfer.getData('leadId');
        onDrop(id, status);
    };

    return (
        <div 
            onDragOver={handleDragOver} 
            onDrop={handleDrop}
            className="bg-slate-100/50 dark:bg-slate-950/40 border-2 border-white/5 rounded-[3rem] p-6 min-h-[500px] flex flex-col space-y-4"
        >
            <div className="flex justify-between items-center mb-6 pl-2">
                <h4 className="text-[11px] font-black uppercase italic tracking-[0.3em] text-orange-500">{title}</h4>
                <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 text-[10px] font-black flex items-center justify-center border border-white/5">{leads.length}</div>
            </div>
            <div className="space-y-4 flex-1">
                {leads.map((l: any) => (
                    <div 
                        key={l.id} 
                        draggable 
                        onDragStart={(e) => e.dataTransfer.setData('leadId', l.id)}
                        className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/10 p-6 rounded-2xl shadow-xl cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-orange-500/50 transition-all group"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className={`text-2xl font-black italic tracking-tighter ${l.ai_score > 80 ? 'text-red-500' : 'text-orange-500'}`}>{l.ai_score}</span>
                            <Target size={14} className="opacity-20" />
                        </div>
                        <h5 className="text-[12px] font-black italic uppercase leading-none text-foreground mb-3">{l.company_name}</h5>
                        <div className="pt-4 border-t border-slate-50 dark:border-white/5 flex justify-between items-center">
                            <Link to={`/lead/${l.id}`} className="text-[9px] font-black text-slate-500 uppercase italic hover:text-orange-500 flex items-center gap-1">VIEW NODE <ChevronRight size={10}/></Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReportCard({ title, val, trend, icon }: any) {
    return (
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-all text-orange-500">
                {icon}
            </div>
            <h4 className="text-[10px] font-black uppercase italic tracking-widest text-slate-400 mb-6">{title}</h4>
            <div className="text-5xl font-black italic tracking-tighter text-foreground mb-4">{val}</div>
            <div className="text-[10px] font-black uppercase italic text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full inline-block border border-orange-500/20">{trend}</div>
        </div>
    );
}

function Input({ label, value, onChange }: any) {
    return (
        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase italic text-slate-500 tracking-widest ml-1">{label}</span>
            <input 
                className="bg-slate-100 dark:bg-slate-900 border-2 border-white/10 p-5 rounded-2xl w-full text-xs font-black italic uppercase outline-none focus:border-orange-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800 shadow-inner"
                value={value} onChange={e => onChange(e.target.value)}
                placeholder={`ENTER ${label.toUpperCase()}`}
            />
        </div>
    );
}
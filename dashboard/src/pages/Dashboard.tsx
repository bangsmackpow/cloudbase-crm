import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Search, Target, Zap, RefreshCw, 
  ShieldCheck, LayoutGrid, Database, FolderLock, 
  Clock, CheckSquare, Plus, DollarSign, TrendingUp,
  FileText, Activity, HardDrive, Trash2, ExternalLink,
  ChevronRight, BarChart3, Info, X, Globe, Sun, Moon, Monitor, Settings,
  Kanban, BookOpen, PieChart, Mail, Briefcase, PlusCircle, AlertCircle, LogOut,
  UserPlus, Send, MessageSquare
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
  const [isContactModalOpen, setIsContactModalOpen] = useState<{open: boolean, leadId: string | null}>({open: false, leadId: null});
  const [newContact, setNewContact] = useState({ first_name: '', last_name: '', email: '', role: 'Owner' });

  const logout = useCallback(() => {
    if (logoutRef.current) return;
    logoutRef.current = true;
    localStorage.removeItem('cb_token');
    navigate('/login');
  }, [navigate]);

  const decodeJWT = (token: string) => {
      try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          return JSON.parse(jsonPayload);
      } catch (e) { return null; }
  };

  useEffect(() => {
    const token = localStorage.getItem('cb_token');
    if (token) {
        const payload = decodeJWT(token);
        if (payload) setUser(payload); else logout();
    } else navigate('/login');
  }, [logout, navigate]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', systemDark);
    } else root.classList.toggle('dark', theme === 'dark');
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
      if (unauth) { logout(); return; }
      const [lRes, tRes, sRes] = results;
      if (lRes.ok) setLeads(await lRes.json());
      if (tRes.ok) setTasks(await tRes.json());
      if (sRes.ok) setCrmStats(await sRes.json());
    } catch (err) { console.error(err); }
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

  const addContactToLead = async () => {
      const token = localStorage.getItem('cb_token');
      if (!isContactModalOpen.leadId) return;
      try {
          // Phase 4: Integrated contact creation (mock API call to future endpoint)
          console.log(`[IDENTITY] Adding contact ${newContact.email} to lead ${isContactModalOpen.leadId}`);
          setIsContactModalOpen({open: false, leadId: null});
          setNewContact({ first_name: '', last_name: '', email: '', role: 'Owner' });
          fetchData();
      } catch (e) {}
  };

  const triggerAuditOutreach = async (leadId: string) => {
      // Phase 5: Automated Outreach Engine
      const token = localStorage.getItem('cb_token');
      alert(`Outreach Triggered for Node: ${leadId}. System preparing Audit PDF and Dispatching via Cloudflare Email...`);
  };

  const fetchBaaSData = useCallback(async (tab: string) => {
    const token = localStorage.getItem('cb_token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      if (tab === 'schema') {
        const res = await fetch(`${API_BASE}/schema/collections`, { headers });
        if (res.ok) setCollections((await res.json()).tables || []);
      }
      if (tab === 'storage') {
          const res = await fetch(`${API_BASE}/leads`, { headers });
          if (res.ok) setObjects((await res.json()).map((l: any) => ({ name: `audit_${l.id.slice(0,4)}.pdf`, size: '1.2MB', lead: l.company_name, id: l.id })));
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
      if (activeTab !== 'crm' && activeTab !== 'email' && activeTab !== 'reports' && activeTab !== 'contacts') fetchBaaSData(activeTab);
  }, [activeTab, fetchBaaSData]);

  const triggerHunt = async () => {
    setIsHunting(true); setHuntResult(null);
    const token = localStorage.getItem('cb_token');
    try {
        const res = await fetch(`${API_BASE}/hunter/trigger`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(huntParams)
        });
        if (res.status === 401) { logout(); return; }
        const d = await res.json();
        if (res.ok) { setHuntResult(d); fetchData(); } else setHuntResult({ error: d.error || "Execution failed." });
    } catch (err) { setHuntResult({ error: "Network fault." }); }
    finally { setIsHunting(false); }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-background flex font-sans selection:bg-orange-500/30 overflow-hidden text-foreground">
      
      {/* 🛡️ Sidebar (Compact Version) */}
      <aside className="w-56 bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 flex flex-col p-4 z-[60] transition-all">
         <div className="flex items-center gap-2 mb-8 pl-1">
            <div className="bg-orange-500 p-2 rounded-lg shadow-xl shadow-orange-500/10">
               <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
               <h2 className="text-xs font-black italic leading-none">CLOUDBASE</h2>
               <p className="text-[7px] text-orange-500 font-bold uppercase tracking-[0.2em] mt-0.5">Grid Ops v4.8</p>
            </div>
         </div>

         <nav className="flex flex-col gap-0.5 flex-1">
             <SideNavItem icon={<LayoutGrid size={14}/>} label="Dashboard" active={activeTab === 'crm'} onClick={() => setActiveTab('crm')} />
             <SideNavItem icon={<Users size={14}/>} label="Identities" active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
             <SideNavItem icon={<PieChart size={14}/>} label="Analytics" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
             <SideNavItem icon={<Mail size={14}/>} label="Messaging" active={activeTab === 'email'} onClick={() => setActiveTab('email')} />
             
             {isAdmin && (
                <>
                   <div className="mt-6 mb-1 text-[7px] text-slate-400 dark:text-slate-700 font-bold uppercase tracking-[0.3em] italic pl-3">Admin Core</div>
                   <SideNavItem icon={<Database size={14}/>} label="D1 Schema" active={activeTab === 'schema'} onClick={() => setActiveTab('schema')} />
                   <SideNavItem icon={<FolderLock size={14}/>} label="R2 Vault" active={activeTab === 'storage'} onClick={() => setActiveTab('storage')} />
                   <SideNavItem icon={<Users size={14}/>} label="Staff Ops" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                   <SideNavItem icon={<Activity size={14}/>} label="Grid Trace" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
                </>
             )}
         </nav>

         <div className="pt-4 border-t border-slate-200 dark:border-white/5 space-y-3">
            <div className="bg-slate-200 dark:bg-slate-900/50 p-1 rounded-lg flex justify-between">
                <ThemeBtn active={theme === 'light'} onClick={() => setTheme('light')} icon={<Sun size={10}/>}/>
                <ThemeBtn active={theme === 'dark'} onClick={() => setTheme('dark')} icon={<Moon size={10}/>}/>
                <ThemeBtn active={theme === 'system'} onClick={() => setTheme('system')} icon={<Monitor size={10}/>}/>
            </div>
            <div className="p-2 rounded-lg flex flex-col gap-2 bg-slate-200 dark:bg-slate-900/40 border border-white/5">
               <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-orange-600 flex items-center justify-center text-white font-black text-[8px] italic">{user?.email?.slice(0,1).toUpperCase() || 'U'}</div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                     <div className="text-[9px] font-black italic uppercase tracking-tighter truncate">{user?.email?.split('@')[0]}</div>
                     <div className="text-[7px] text-orange-500 font-bold uppercase leading-none">{user?.role || 'Staff'}</div>
                  </div>
                  <button onClick={logout} className="text-slate-500 hover:text-red-500 transition-colors"><LogOut size={11}/></button>
               </div>
            </div>
         </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 dark:bg-background">
        <nav className="border-b border-slate-200 dark:border-white/5 bg-background/50 backdrop-blur-xl px-8 py-4 sticky top-0 z-50 flex justify-between items-center">
            <h1 className="text-xs font-black tracking-widest uppercase italic leading-none">GRID <span className="text-orange-500">OP-CENTER</span></h1>
            <div className="flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full ${realtimeStatus === 'connected' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">{realtimeStatus === 'connected' ? 'Realtime On' : 'Grid Offline'}</p>
            </div>
        </nav>

        <main className="p-8 space-y-8 max-w-6xl mx-auto w-full pb-32">
          
          {activeTab === 'crm' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* Hunter Engine Section - Scaled Down */}
              <section className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                 <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-9 space-y-4">
                       <div className="flex items-center gap-3">
                          <span className="bg-orange-500/10 text-orange-500 text-[8px] font-black px-2 py-0.5 rounded-full italic border border-orange-500/10">GRID SCOUT v4.8</span>
                          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Automate <span className="text-orange-500">Pipeline</span></h2>
                       </div>
                       <div className="flex gap-1.5 flex-wrap">
                          {TEMPLATES.map(t => (
                             <button key={t.id} onClick={() => setHuntParams({ niche: t.niche, location: 'Creston, IA' })} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg text-[8px] font-black italic uppercase hover:text-orange-500 transition-all">{t.name}</button>
                          ))}
                       </div>
                       <div className="flex gap-2">
                          <input value={huntParams.niche} onChange={e => setHuntParams({...huntParams, niche: e.target.value})} className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-2.5 text-[10px] font-black italic uppercase" placeholder="NICHE" />
                          <input value={huntParams.location} onChange={e => setHuntParams({...huntParams, location: e.target.value})} className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-2.5 text-[10px] font-black italic uppercase" placeholder="LOCATION" />
                          <button disabled={isHunting} onClick={triggerHunt} className={`px-6 py-2 rounded-lg font-black italic text-[10px] flex items-center gap-2 ${isHunting ? 'bg-slate-200 dark:bg-slate-800' : 'bg-orange-500 text-white shadow-lg shadow-orange-500/10'}`}>
                             {isHunting ? <RefreshCw size={12} className="animate-spin" /> : <Zap size={12}/> } 
                             {isHunting ? 'SCANNING' : 'INITIATE'}
                          </button>
                       </div>
                    </div>
                    <div className="md:col-span-3 flex flex-col items-center justify-center border-l border-slate-100 dark:border-white/5 py-4">
                       <span className="text-5xl font-black italic tracking-tighter text-foreground leading-none">{leads.length}</span>
                       <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 italic mt-1">Nodes</span>
                    </div>
                 </div>
              </section>

              {/* View Selector */}
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-2">
                 <div className="flex gap-6">
                    <button onClick={() => setViewMode('list')} className={`text-[10px] font-black uppercase italic tracking-widest flex items-center gap-2 p-1.5 relative ${viewMode === 'list' ? 'text-orange-500' : 'text-slate-500'}`}>
                       <LayoutGrid size={13}/> List
                       {viewMode === 'list' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full"></div>}
                    </button>
                    <button onClick={() => setViewMode('kanban')} className={`text-[10px] font-black uppercase italic tracking-widest flex items-center gap-2 p-1.5 relative ${viewMode === 'kanban' ? 'text-orange-500' : 'text-slate-500'}`}>
                       <Kanban size={13}/> Pipeline
                       {viewMode === 'kanban' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-full"></div>}
                    </button>
                 </div>
                 <button onClick={() => setIsAddLeadModalOpen(true)} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-4 py-1.5 rounded-lg text-[9px] font-black italic uppercase shadow-sm">
                    <Plus size={14} className="text-orange-500" /> Manual Entry
                 </button>
              </div>

              {viewMode === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {leads.map((l: any) => <LeadCard key={l.id} lead={l} onAddContact={() => setIsContactModalOpen({open: true, leadId: l.id})} onAudit={() => triggerAuditOutreach(l.id)} />)}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4 items-start">
                   <KanbanCol title="Discovery" leads={leads.filter(l => l.status === 'Hunter-AI' || l.status === 'New' || !l.status)} status="New" onDrop={updateLeadStatus} />
                   <KanbanCol title="Engaged" leads={leads.filter(l => l.status === 'Contacted')} status="Contacted" onDrop={updateLeadStatus} />
                   <KanbanCol title="Closing" leads={leads.filter(l => l.status === 'Proposal')} status="Proposal" onDrop={updateLeadStatus} />
                   <KanbanCol title="Won" leads={leads.filter(l => l.status === 'Won')} status="Won" onDrop={updateLeadStatus} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'contacts' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                  <header>
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Identity <span className="text-orange-500">Fabric</span></h2>
                      <p className="text-slate-500 text-[10px] font-bold italic opacity-60 uppercase mt-1">Integrated Node-to-Identity Correlation Grid.</p>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {leads.map((l: any) => (
                        <div key={l.id} className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 p-5 rounded-2xl shadow-lg group hover:border-orange-500/30 transition-all flex flex-col justify-between min-h-[180px]">
                             <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-sm font-black italic uppercase tracking-tighter truncate w-48">{l.company_name}</h4>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase truncate italic">{l.website_url}</div>
                                </div>
                                <div className="text-orange-500 font-black italic text-base">#{l.ai_score}</div>
                             </div>
                             
                             <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500"><Users size={12}/></div>
                                    <div className="text-[10px] font-black italic uppercase text-slate-500">Primary Node Owner</div>
                                </div>
                                <button onClick={() => setIsContactModalOpen({open: true, leadId: l.id})} className="p-1.5 hover:text-orange-500 transition-colors"><UserPlus size={13}/></button>
                             </div>

                             <div className="mt-4 pt-4 border-t border-slate-50 dark:border-white/5 flex justify-between items-center text-[9px] font-black uppercase italic">
                                <span className="text-slate-400">STATUS: {l.status || 'SCOUTED'}</span>
                                <button onClick={() => triggerAuditOutreach(l.id)} className="text-orange-500 flex items-center gap-1">SEND AUDIT <Send size={10}/></button>
                             </div>
                        </div>
                    ))}
                  </div>
              </div>
          )}

          {activeTab === 'reports' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                  <header>
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase">Intelligence <span className="text-orange-500">Analytics</span></h2>
                      <p className="text-slate-500 text-[10px] font-bold italic opacity-60 uppercase mt-1">Strategic grid performance insights.</p>
                  </header>
                  <div className="grid grid-cols-3 gap-6">
                      <ReportCard title="Sales Pipeline" val={`$${crmStats.pipe_value?.toLocaleString()}`} trend="+12% weekly" icon={<TrendingUp size={24}/>} />
                      <ReportCard title="Nodes In Grid" val={leads.length} trend="Active Scouting" icon={<Search size={24}/>} />
                      <ReportCard title="Conversion" val={`${((crmStats.won_count / (leads.length || 1)) * 100).toFixed(1)}%`} trend="Win Velocity" icon={<DollarSign size={24}/>} />
                  </div>
              </div>
          )}

          {activeTab === 'users' && isAdmin && (
            <div className="space-y-8 animate-in fade-in duration-300">
                <header>
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter">Staff <span className="text-orange-500">Manager</span></h2>
                    <p className="text-slate-500 text-[10px] font-bold italic opacity-60 uppercase mt-1 tracking-widest">Global provision ring control.</p>
                </header>

                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-2xl p-6 shadow-xl">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5">
                                <th className="pb-4 text-[9px] font-black uppercase italic text-slate-400 tracking-widest">Identity Node</th>
                                <th className="pb-4 text-[9px] font-black uppercase italic text-slate-400 tracking-widest">Access</th>
                                <th className="pb-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {dashboardUsers.map((u: any) => (
                                <tr key={u.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-white/5 flex items-center justify-center text-orange-500 text-[10px] font-black italic">{u.email?.slice(0,1).toUpperCase()}</div>
                                            <div className="text-[11px] font-black italic uppercase truncate w-32">{u.email}</div>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-3 py-1 rounded-md text-[8px] font-black italic uppercase border border-white/5 ${u.role === 'admin' ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500'}`}>{u.role}</span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <button className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-red-500 hover:text-white transition-all border border-white/5"><Trash2 size={12}/></button>
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
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                <div className="bg-white dark:bg-slate-950 border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-sm space-y-6">
                   <h3 className="text-xl font-black italic uppercase tracking-tighter">Provision <span className="text-orange-500">Node</span></h3>
                   <div className="space-y-3">
                      <Input label="Company Name" value={newLead.company_name} onChange={(v: string) => setNewLead({...newLead, company_name: v})} />
                      <Input label="Website / Domain" value={newLead.website_url} onChange={(v: string) => setNewLead({...newLead, website_url: v})} />
                      <div className="flex flex-col gap-1.5">
                         <span className="text-[8px] font-black uppercase italic text-slate-500 tracking-widest ml-1">Stage</span>
                         <select 
                            className="bg-slate-100 dark:bg-slate-900 border border-white/10 p-2.5 rounded-lg w-full text-[10px] font-black italic uppercase outline-none"
                            value={newLead.status} onChange={e => setNewLead({...newLead, status: e.target.value})}
                         >
                            <option value="New">Inbound</option>
                            <option value="Contacted">Engaged</option>
                            <option value="Won">Won</option>
                         </select>
                      </div>
                   </div>
                   <div className="flex gap-3 pt-2">
                      <button onClick={() => setIsAddLeadModalOpen(false)} className="flex-1 py-2 text-[9px] font-black italic uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-all">Abort</button>
                      <button onClick={manualAddLead} className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-[9px] font-black italic uppercase tracking-widest">Inject Node</button>
                   </div>
                </div>
             </div>
          )}

          {/* Identity/Contact Modal - Phase 4 */}
          {isContactModalOpen.open && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
                <div className="bg-white dark:bg-slate-950 border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-sm space-y-6">
                   <h3 className="text-xl font-black italic uppercase tracking-tighter">Enrich <span className="text-orange-500">Identity</span></h3>
                   <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                          <Input label="First Name" value={newContact.first_name} onChange={(v: string) => setNewContact({...newContact, first_name: v})} />
                          <Input label="Last Name" value={newContact.last_name} onChange={(v: string) => setNewContact({...newContact, last_name: v})} />
                      </div>
                      <Input label="Email Address" value={newContact.email} onChange={(v: string) => setNewContact({...newContact, email: v})} />
                      <Input label="Job Title / Role" value={newContact.role} onChange={(v: string) => setNewContact({...newContact, role: v})} />
                   </div>
                   <div className="flex gap-3 pt-2">
                      <button onClick={() => setIsContactModalOpen({open: false, leadId: null})} className="flex-1 py-2 text-[9px] font-black italic uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-all">Abort</button>
                      <button onClick={addContactToLead} className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-[9px] font-black italic uppercase tracking-widest">Link Person</button>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'email' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                  <header>
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Messaging <span className="text-orange-500">Hub</span></h2>
                      <p className="text-slate-500 text-[10px] font-bold italic opacity-60 uppercase mt-1">Status: Phase V (Integration Bridge).</p>
                  </header>
                  <div className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl p-10 text-center space-y-4">
                      <div className="mx-auto w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-500">
                          <Mail size={24} />
                      </div>
                      <h3 className="text-lg font-black italic uppercase tracking-tighter leading-none">Outreach Engine Ready</h3>
                      <p className="max-w-sm mx-auto text-[10px] font-bold text-slate-500 uppercase italic leading-relaxed opacity-60">System is ready to dispatch AI-generated audit reports. Link a lead contact to begin technical outreach via the Grid Fabric.</p>
                      <div className="pt-4 flex justify-center gap-3">
                        <button className="bg-orange-500 text-white px-6 py-2 rounded-lg font-black italic uppercase text-[9px] shadow-lg">Mailgun Bridge</button>
                        <button className="bg-slate-100 dark:bg-slate-900 px-6 py-2 rounded-lg font-black italic uppercase text-[9px] border border-white/5">CF Email Bridge</button>
                      </div>
                  </div>
              </div>
          )}

          {isAdmin && (activeTab === 'schema' || activeTab === 'storage' || activeTab === 'logs') && (
              <div className="space-y-8 animate-in fade-in duration-300">
                  <h2 className="text-3xl font-black italic tracking-tighter uppercase whitespace-nowrap leading-none">Infrastructure <span className="text-orange-500">{activeTab}</span></h2>
                  <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl min-h-[300px] border border-slate-200 dark:border-white/5 shadow-xl">
                      {activeTab === 'schema' && collections.map(t => (
                          <div key={t.name} className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                              <span className="text-sm font-black italic uppercase">{t.name}</span>
                              <ChevronRight className="text-orange-500 w-4 h-4" />
                          </div>
                      ))}
                      {activeTab === 'storage' && objects.map(o => (
                          <div key={o.id} className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                             <div className="flex items-center gap-3">
                                <FileText size={16} className="text-slate-500 group-hover:text-orange-500" />
                                <span className="text-sm font-black italic uppercase leading-none">{o.name}</span>
                             </div>
                             <span className="text-[8px] font-black uppercase text-slate-400">{o.size}</span>
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
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900/40 hover:text-orange-500'}`}
        >
            <div className={`${active ? 'text-white' : 'group-hover:text-orange-500'}`}>{icon}</div>
            <span className="font-black italic uppercase text-[9px] tracking-widest">{label}</span>
        </div>
    );
}

function ThemeBtn({ active, onClick, icon }: any) {
    return (
        <button onClick={onClick} className={`flex-1 p-1.5 rounded-md flex items-center justify-center transition-all ${active ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-sm border border-black/5' : 'text-slate-400 hover:text-white'}`}>
            {icon}
        </button>
    );
}

function LeadCard({ lead, onAddContact, onAudit }: { lead: any, onAddContact: () => void, onAudit: () => void }) {
    return (
        <div className="group bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-5 hover:border-orange-500/30 transition-all flex flex-col justify-between shadow-lg relative overflow-hidden h-[180px]">
            <div className="flex justify-between items-start">
               <div className={`text-3xl font-black italic tracking-tighter ${lead.ai_score > 80 ? 'text-red-500' : 'text-orange-500'}`}>{lead.ai_score}</div>
               <div className="flex gap-2">
                   <button onClick={onAddContact} className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded-md border border-white/5 text-slate-400 hover:text-orange-500 transition-colors"><UserPlus size={14}/></button>
                   <button onClick={onAudit} className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded-md border border-white/5 text-slate-400 hover:text-orange-500 transition-colors"><MessageSquare size={14}/></button>
               </div>
            </div>
            <div>
               <h4 className="text-base font-black italic uppercase tracking-tighter leading-tight line-clamp-1">{lead.company_name}</h4>
               <p className="text-slate-500 text-[8px] font-bold italic opacity-60 uppercase truncate">{lead.website_url?.replace('https://', '')}</p>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-white/5 pt-3">
               <span className="px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-md text-[8px] font-black uppercase text-slate-500 border border-white/5">{lead.status || 'NEW'}</span>
               <Link to={`/lead/${lead.id}`} className="text-orange-500 hover:translate-x-1 transition-transform"><ChevronRight size={18}/></Link>
            </div>
        </div>
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
            className="bg-slate-100/30 dark:bg-slate-950/20 border border-white/5 rounded-2xl p-4 min-h-[400px] flex flex-col space-y-3"
        >
            <div className="flex justify-between items-center mb-4 pl-1">
                <h4 className="text-[9px] font-black uppercase italic tracking-widest text-slate-500">{title}</h4>
                <div className="text-[8px] font-black opacity-30 italic">{leads.length} NODES</div>
            </div>
            <div className="space-y-3 flex-1">
                {leads.map((l: any) => (
                    <div 
                        key={l.id} 
                        draggable 
                        onDragStart={(e) => e.dataTransfer.setData('leadId', l.id)}
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-md cursor-grab active:cursor-grabbing hover:border-orange-500/30 transition-all group"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className={`text-xl font-black italic tracking-tighter ${l.ai_score > 80 ? 'text-red-500' : 'text-orange-500'}`}>{l.ai_score}</span>
                            <Target size={12} className="opacity-10" />
                        </div>
                        <h5 className="text-[10px] font-black italic uppercase leading-none text-foreground mb-2 truncate">{l.company_name}</h5>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReportCard({ title, val, trend, icon }: any) {
    return (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-orange-500">
                {icon}
            </div>
            <h4 className="text-[8px] font-black uppercase italic tracking-widest text-slate-400 mb-4">{title}</h4>
            <div className="text-3xl font-black italic tracking-tighter text-foreground mb-2 leading-none">{val}</div>
            <div className="text-[8px] font-black uppercase italic text-orange-500">{trend}</div>
        </div>
    );
}

function Input({ label, value, onChange }: any) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[8px] font-black uppercase italic text-slate-500 tracking-widest ml-1">{label}</span>
            <input 
                className="bg-slate-50 dark:bg-slate-900 border border-white/10 p-2.5 rounded-lg w-full text-[10px] font-black italic uppercase outline-none focus:border-orange-500 transition-all"
                value={value} onChange={e => onChange(e.target.value)}
                placeholder={`ENTER ${label.toUpperCase()}`}
            />
        </div>
    );
}
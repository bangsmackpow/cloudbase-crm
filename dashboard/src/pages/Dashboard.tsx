import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, Search, Target, Zap, RefreshCw, 
  ShieldCheck, LayoutGrid, Database, FolderLock, 
  Clock, CheckSquare, Plus, DollarSign, TrendingUp,
  FileText, Activity, HardDrive, Trash2, ExternalLink,
  ChevronRight, BarChart3, Info, X, Globe, Sun, Moon, Monitor, Settings,
  Kanban, BookOpen, PieChart, Mail, Briefcase, PlusCircle, AlertCircle, LogOut,
  UserPlus, Send, MessageSquare, CheckCircle, XCircle, Bell, User, Key, Lock, Mail as MailIcon
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  
  const [collections, setCollections] = useState<any[]>([]);
  const [objects, setObjects] = useState<any[]>([]);
  const [dashboardUsers, setDashboardUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [billingInfo, setBillingInfo] = useState({ plan: 'Enterprise Matrix', cycle: 'Annual', nextBill: '2026-04-12', amount: '$2,400.00' });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  const navigate = useNavigate();
  const logoutRef = useRef(false);

  // Modals
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({ company_name: '', website_url: '', status: 'New' });
  const [isContactModalOpen, setIsContactModalOpen] = useState<{open: boolean, leadId: string | null}>({open: false, leadId: null});
  const [newContact, setNewContact] = useState({ first_name: '', last_name: '', email: '', role: 'Owner' });

  // Admin / Settings Modals
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [targetStaff, setTargetStaff] = useState<any>(null);
  const [settingsData, setSettingsData] = useState({ oldPassword: '', newPassword: '', newEmail: '' });
  const [staffData, setStaffData] = useState({ email: '', password: '', role: 'staff' });

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

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('cb_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    if (!user) {
        const decoded = decodeJWT(token || '');
        if (decoded) setUser(decoded);
    }

    try {
      const [leadRes, taskRes, statsRes, notifyRes] = await Promise.all([
        fetch(`${API_BASE}/crm/leads`, { headers }),
        fetch(`${API_BASE}/crm/tasks`, { headers }),
        fetch(`${API_BASE}/crm/stats`, { headers }),
        fetch(`${API_BASE}/crm/notifications`, { headers })
      ]);
      
      if (leadRes.status === 401) { logout(); return; }
      
      if (leadRes.ok) setLeads(await leadRes.json());
      if (taskRes.ok) setTasks(await taskRes.json());
      if (statsRes.ok) setCrmStats(await statsRes.json());
      if (notifyRes.ok) setNotifications(await notifyRes.json());
    } catch (err) { console.error(err); }
  }, [logout]);

  const fetchBaaSData = useCallback(async (tab: string) => {
    const token = localStorage.getItem('cb_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      if (tab === 'schema') {
          const res = await fetch(`${API_BASE}/schema/collections`, { headers });
          if (res.ok) setCollections(await res.json());
      }
      if (tab === 'storage') {
          const res = await fetch(`${API_BASE}/storage/list`, { headers });
          if (res.ok) setObjects((await res.json()).map((l: any) => ({ name: `audit_${l.id.slice(0,4)}.pdf`, size: '1.2MB', lead: l.company_name, id: l.id })));
      }
      if (tab === 'users') {
          const res = await fetch(`${API_BASE}/auth/users`, { headers });
          if (res.ok) setDashboardUsers(await res.json());
      }
      if (tab === 'automation') {
          const res = await fetch(`${API_BASE}/crm/workflows`, { headers });
          if (res.ok) setWorkflows(await res.json());
      }
      if (tab === 'audit') {
          const res = await fetch(`${API_BASE}/crm/admin/audit`, { headers });
          if (res.ok) setAuditLogs(await res.json());
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
      if (['schema', 'storage', 'users', 'automation', 'audit'].includes(activeTab)) fetchBaaSData(activeTab);
  }, [activeTab, fetchBaaSData]);

  const updateLeadStatus = async (leadId: string, status: string) => {
    const token = localStorage.getItem('cb_token');
    await fetch(`${API_BASE}/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    fetchData();
  };

  const updateStaff = async (e: React.FormEvent) => {
      e.preventDefault();
      const token = localStorage.getItem('cb_token');
      const url = targetStaff ? `${API_BASE}/auth/users/${targetStaff.id}` : `${API_BASE}/auth/users`;
      const method = targetStaff ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
          method,
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(staffData)
      });
      if (res.ok) {
          setIsStaffModalOpen(false);
          setTargetStaff(null);
          setStaffData({ email: '', password: '', role: 'staff' });
          fetchBaaSData('users');
      } else {
          const err = await res.json();
          alert(`Provisioning Failed: ${err.error || 'Check authorization'}`);
      }
  };

  const deleteStaff = async (sid: string) => {
      if (!window.confirm("Terminate this staff access?")) return;
      const token = localStorage.getItem('cb_token');
      await fetch(`${API_BASE}/auth/users/${sid}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchBaaSData('users');
  };

  const handleSelfUpdate = async (type: 'email' | 'password') => {
      const token = localStorage.getItem('cb_token');
      const url = type === 'email' ? `${API_BASE}/auth/me/email` : `${API_BASE}/auth/me/password`;
      const body = type === 'email' ? { newEmail: settingsData.newEmail } : { oldPassword: settingsData.oldPassword, newPassword: settingsData.newPassword };
      
      const res = await fetch(url, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
      });
      if (res.ok) {
          alert(`Auth Node Updated: Please logout and login again.`);
          setIsSettingsModalOpen(false);
      } else {
          const err = await res.json();
          alert(`Update Refused: ${err.error || 'System Rejection'}`);
      }
  };

  const triggerHunt = async () => {
    setIsHunting(true); setHuntResult(null);
    const token = localStorage.getItem('cb_token');
    try {
        const res = await fetch(`${API_BASE}/hunter/trigger`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(huntParams)
        });
        const d = await res.json();
        if (res.ok) { setHuntResult(d); fetchData(); } 
    } catch (err) {}
    finally { setIsHunting(false); }
  };

  const deleteWorkflow = async (id: string) => {
    const token = localStorage.getItem('cb_token');
    await fetch(`${API_BASE}/crm/workflows/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchBaaSData('automation');
  };

  const bulkUpdateStatus = async (status: string) => {
    const token = localStorage.getItem('cb_token');
    await Promise.all(selectedLeads.map(id => 
        fetch(`${API_BASE}/crm/leads/${id}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        })
    ));
    setSelectedLeads([]);
    fetchData();
  };

  const bulkDeleteLeads = async () => {
    if (!confirm(`Are you sure you want to expunge ${selectedLeads.length} prospects?`)) return;
    const token = localStorage.getItem('cb_token');
    await Promise.all(selectedLeads.map(id => 
        fetch(`${API_BASE}/crm/leads/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } })
    ));
    setSelectedLeads([]);
    fetchData();
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <div className={`min-h-screen bg-background flex font-sans selection:bg-primary/30 overflow-hidden text-foreground ${theme}`}>
      
      {/* Sidebar */}
      <aside className="w-56 bg-slate-100 dark:bg-slate-950 border-r border-slate-200 dark:border-white/5 flex flex-col p-4 z-[60] transition-all">
         <div className="flex items-center gap-2 mb-8 pl-1">
            <div className="bg-primary p-2 rounded-lg shadow-xl shadow-primary/10">
               <ShieldCheck size={18} className="text-primary-foreground" />
            </div>
            <div>
               <h2 className="text-xs font-black italic leading-none">CLOUDBASE</h2>
               <p className="text-[7px] text-primary font-bold uppercase tracking-[0.2em] mt-0.5">Admin Ops v6.0</p>
            </div>
         </div>

         <nav className="flex flex-col gap-0.5 flex-1">
             <SideNavItem icon={<LayoutGrid size={14}/>} label="Leads" active={activeTab === 'crm'} onClick={() => setActiveTab('crm')} />
             <SideNavItem icon={<CheckSquare size={14}/>} label="Tasks" active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
             <SideNavItem icon={<Users size={14}/>} label="Contacts" active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
             <SideNavItem icon={<Zap size={14}/>} label="Discovery" active={activeTab === 'hunter'} onClick={() => setActiveTab('hunter')} />
             <SideNavItem icon={<PieChart size={14}/>} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
             
             {isAdmin && (
                <>
                   <div className="mt-6 mb-1 text-[7px] text-slate-400 dark:text-slate-700 font-bold uppercase tracking-[0.3em] italic pl-3">Systems</div>
                   <SideNavItem icon={<Users size={14}/>} label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                   <SideNavItem icon={<Zap size={14}/>} label="Automations" active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} />
                   <SideNavItem icon={<Database size={14}/>} label="Database" active={activeTab === 'schema'} onClick={() => setActiveTab('schema')} />
                   <SideNavItem icon={<FolderLock size={14}/>} label="Vault Explorer" active={activeTab === 'storage'} onClick={() => setActiveTab('storage')} />
                   <SideNavItem icon={<DollarSign size={14}/>} label="Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
                </>
             )}
         </nav>

         <div className="pt-4 border-t border-slate-200 dark:border-white/5 space-y-3">
            <div className="bg-slate-200 dark:bg-slate-900/50 p-1 rounded-lg flex justify-between gap-1">
                <ThemeBtn active={theme === 'light'} onClick={() => { setTheme('light'); localStorage.setItem('theme', 'light'); }} icon={<Sun size={10}/>} label="Arctic"/>
                <ThemeBtn active={theme === 'dark'} onClick={() => { setTheme('dark'); localStorage.setItem('theme', 'dark'); }} icon={<Moon size={10}/>} label="Midnight"/>
                <ThemeBtn active={theme === 'emerald'} onClick={() => { setTheme('emerald'); localStorage.setItem('theme', 'emerald'); }} icon={<Monitor size={10}/>} label="Executive"/>
            </div>
            <div className="p-2 rounded-lg flex gap-2 bg-slate-200 dark:bg-slate-900/40 border border-white/5">
                <button onClick={() => setIsSettingsModalOpen(true)} className="w-6 h-6 rounded-md bg-primary hover:bg-primary/90 transition-colors flex items-center justify-center text-primary-foreground font-black text-[8px] italic">
                    <User size={12}/>
                </button>
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="text-[9px] font-black italic uppercase tracking-tighter truncate">{user?.email?.split('@')[0]}</div>
                    <button onClick={logout} className="text-[7px] text-slate-500 uppercase font-bold text-left hover:text-red-500 transition-colors flex items-center gap-1">Terminate <LogOut size={8}/></button>
                </div>
            </div>
         </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 dark:bg-background">
        <nav className="border-b border-slate-200 dark:border-white/5 bg-background/50 backdrop-blur-xl px-8 py-4 sticky top-0 z-50 flex justify-between items-center text-foreground">
            <h1 className="text-xs font-black tracking-widest uppercase italic leading-none">COMMAND <span className="text-primary">DASHBOARD</span></h1>
            <div className="flex items-center gap-6">
                <div className="relative">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-primary transition-all active:scale-95 relative">
                        <Bell size={16} />
                        {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full border border-background"></span>}
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 mt-4 w-72 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-3xl shadow-2xl p-4 overflow-hidden animate-in zoom-in-95 fade-in duration-200 z-[100]">
                            <h3 className="text-[10px] font-black uppercase italic tracking-widest text-slate-500 mb-4 px-2">Internal Alerts</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {notifications.map(n => (
                                    <div key={n.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-white/5 space-y-1">
                                        <div className="text-[7px] font-black text-primary uppercase italic opacity-60">{n.type}</div>
                                        <p className="text-[9px] font-bold text-slate-400 italic leading-tight">{n.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${realtimeStatus === 'connected' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest italic">System Status</p>
                </div>
            </div>
        </nav>

        <main className="p-8 space-y-8 max-w-6xl mx-auto w-full pb-32">
          
          {activeTab === 'crm' && (
             <div className="space-y-8">
                <header className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Sales <span className="text-primary">Pipeline</span></h2>
                        <p className="text-slate-500 text-[10px] font-bold italic opacity-60 uppercase mt-1">Manage leads and deal progress.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-500" size={14}/>
                            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-xl p-2 pl-10 text-[10px] font-black italic uppercase outline-none focus:border-primary w-48 transition-all focus:w-64" placeholder="Quick Search..." />
                        </div>
                        <button onClick={() => setIsAddLeadModalOpen(true)} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-[10px] font-black uppercase italic shadow-lg shadow-primary/20 active:scale-95 transition-all">Create New Lead</button>
                    </div>
                </header>

                {selectedLeads.length > 0 && (
                    <div className="bg-primary p-4 rounded-3xl flex justify-between items-center animate-in slide-in-from-top-4 duration-300 shadow-xl shadow-primary/20">
                        <div className="text-[10px] font-black text-primary-foreground uppercase italic">{selectedLeads.length} items selected</div>
                        <div className="flex gap-4">
                            <button onClick={() => setSelectedLeads([])} className="text-[10px] font-black text-primary-foreground/60 uppercase italic hover:text-primary-foreground transition-colors">Clear Selection</button>
                            <button onClick={() => bulkUpdateStatus('Won')} className="text-[10px] font-black text-primary-foreground uppercase italic px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">Move to Won</button>
                            <button onClick={bulkDeleteLeads} className="text-[10px] font-black text-white px-4 py-2 bg-red-500 rounded-xl hover:bg-red-400 transition-all shadow-lg active:scale-95">Bulk Expunge</button>
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <KanbanCol title="New Leads" leads={leads.filter(l => l.status === 'New' && l.company_name.toLowerCase().includes(searchTerm.toLowerCase()))} status="New" onDrop={updateLeadStatus} selectedLeads={selectedLeads} onSelect={(id: string) => setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} />
                    <KanbanCol title="In Progress" leads={leads.filter(l => l.status === 'Contacted' && l.company_name.toLowerCase().includes(searchTerm.toLowerCase()))} status="Contacted" onDrop={updateLeadStatus} selectedLeads={selectedLeads} onSelect={(id: string) => setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} />
                    <KanbanCol title="Negotiation" leads={leads.filter(l => l.status === 'Qualified' && l.company_name.toLowerCase().includes(searchTerm.toLowerCase()))} status="Qualified" onDrop={updateLeadStatus} selectedLeads={selectedLeads} onSelect={(id: string) => setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} />
                    <KanbanCol title="Closed Won" leads={leads.filter(l => l.status === 'Won' && l.company_name.toLowerCase().includes(searchTerm.toLowerCase()))} status="Won" onDrop={updateLeadStatus} selectedLeads={selectedLeads} onSelect={(id: string) => setSelectedLeads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])} />
                </div>
             </div>
          )}

          {activeTab === 'tasks' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                  <header>
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Queue <span className="text-orange-500">Management</span></h2>
                      <p className="text-slate-500 text-[10px] font-bold italic opacity-60 uppercase mt-1">Upcoming tasks across all active leads.</p>
                  </header>
                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-xl">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-white/5">
                              <tr>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase italic text-slate-500 tracking-widest">Task</th>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase italic text-slate-500 tracking-widest">Related Lead</th>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase italic text-slate-500 tracking-widest">Due Date</th>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase italic text-slate-500 tracking-widest">Priority</th>
                              </tr>
                          </thead>
                          <tbody>
                              {tasks.map(t => (
                                  <tr key={t.id} className="border-b border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all">
                                      <td className="px-6 py-4">
                                          <div className="text-[11px] font-black italic uppercase text-foreground">{t.title}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <Link to={`/lead/${t.lead_id}`} className="text-[10px] font-bold text-orange-500 hover:underline uppercase italic">{t.company_name}</Link>
                                      </td>
                                      <td className="px-6 py-4 text-[10px] font-black italic text-slate-500 uppercase">{new Date(t.due_at).toLocaleDateString()}</td>
                                      <td className="px-6 py-4">
                                          <span className="px-2 py-1 rounded-md text-[8px] font-black uppercase italic bg-primary/10 text-primary border border-primary/20">{t.priority}</span>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {activeTab === 'contacts' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                  <header>
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Contact <span className="text-primary">Directory</span></h2>
                      <p className="text-slate-500 text-[10px] font-bold italic opacity-60 uppercase mt-1">Personnel details across all identified companies.</p>
                  </header>
                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-3xl p-12 text-center shadow-xl">
                      <Users size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                      <h3 className="text-xl font-black italic uppercase tracking-tighter">Global Contacts List</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase italic mt-2">Aggregate view coming soon. Please view contacts via individual leads.</p>
                  </div>
              </div>
          )}

          {activeTab === 'hunter' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                  <header className="flex justify-between items-end">
                      <div>
                          <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Lead <span className="text-primary">Discovery</span></h2>
                          <p className="text-slate-500 text-[10px] font-bold italic opacity-60 uppercase mt-1">Automated internet intelligence gathering.</p>
                      </div>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      <div className="md:col-span-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-8 rounded-[40px] shadow-xl space-y-6">
                           <div className="space-y-4">
                               <div>
                                   <label className="text-[9px] font-black uppercase text-slate-500 italic tracking-widest ml-1">Industry Niche</label>
                                   <select value={huntParams.niche} onChange={e => setHuntParams({...huntParams, niche: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-white/5 rounded-xl p-3 text-[10px] font-black italic uppercase outline-none focus:border-orange-500 mt-1">
                                       {TEMPLATES.map(t => <option key={t.id} value={t.niche}>{t.name}</option>)}
                                   </select>
                               </div>
                               <div>
                                   <label className="text-[9px] font-black uppercase text-slate-500 italic tracking-widest ml-1">Target Location</label>
                                   <input value={huntParams.location} onChange={e => setHuntParams({...huntParams, location: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-white/5 rounded-xl p-3 text-[10px] font-black italic uppercase outline-none focus:border-orange-500 mt-1" placeholder="City, State" />
                               </div>
                               <button onClick={triggerHunt} disabled={isHunting} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl text-[11px] font-black uppercase italic shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                                   {isHunting ? <RefreshCw className="animate-spin" size={16}/> : <Search size={16}/>}
                                   {isHunting ? 'Analyzing Grid...' : 'Find New Leads'}
                               </button>
                           </div>
                      </div>
                      <div className="md:col-span-8 bg-slate-100 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center text-center">
                          {huntResult ? (
                              <div className="animate-in fade-in zoom-in duration-500">
                                  <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4 mx-auto"><CheckCircle size={32}/></div>
                                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Scan Complete</h3>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase italic mt-2">Discovered {huntResult.length} new prospects matching parameters.</p>
                                  <button onClick={() => setActiveTab('crm')} className="mt-6 text-primary font-black italic uppercase text-[10px] tracking-widest hover:underline">View in Pipeline →</button>
                              </div>
                          ) : (
                              <>
                                  <Zap size={48} className="text-slate-300 dark:text-slate-800 mb-4" />
                                  <h3 className="text-xl font-black italic uppercase tracking-tighter opacity-50">Awaiting Signal</h3>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase italic mt-2">Enter target parameters to begin discovery.</p>
                              </>
                          )}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'users' && isAdmin && (
              <div className="space-y-8 animate-in fade-in duration-300">
                  <header className="flex justify-between items-end">
                      <div>
                          <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">User <span className="text-primary">Management</span></h2>
                          <p className="text-slate-500 text-[10px] font-bold italic opacity-60 uppercase mt-1">Manage personnel access and roles.</p>
                      </div>
                      <button onClick={() => { setTargetStaff(null); setStaffData({email:'', password:'', role:'staff'}); setIsStaffModalOpen(true); }} className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-[10px] font-black uppercase italic shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"><PlusCircle size={14}/> Provision User</button>
                  </header>

                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-xl">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-white/5">
                              <tr>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase italic text-slate-500 tracking-widest">Ident</th>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase italic text-slate-500 tracking-widest">Contact</th>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase italic text-slate-500 tracking-widest">Access Level</th>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase italic text-slate-500 tracking-widest">Commissioned</th>
                                  <th className="px-6 py-4"></th>
                              </tr>
                          </thead>
                          <tbody>
                              {dashboardUsers.map(u => (
                                  <tr key={u.id} className="border-b border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all group">
                                      <td className="px-6 py-4">
                                          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-900 flex items-center justify-center text-slate-500"><User size={16}/></div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="text-[11px] font-black italic uppercase text-foreground">{u.email}</div>
                                          <div className="text-[8px] text-slate-500 font-bold uppercase italic opacity-60">{u.id}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase italic border ${u.role === 'admin' ? 'bg-primary/10 text-primary border-primary/20 font-bold' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 border-white/5'}`}>{u.role}</span>
                                      </td>
                                      <td className="px-6 py-4 text-[10px] font-black italic text-slate-500 uppercase">{new Date(u.created_at).toLocaleDateString()}</td>
                                      <td className="px-6 py-4 text-right">
                                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                              <button onClick={() => { setTargetStaff(u); setStaffData({email: u.email, password: '', role: u.role}); setIsStaffModalOpen(true); }} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all"><Settings size={14}/></button>
                                              <button onClick={() => deleteStaff(u.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14}/></button>
                                          </div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {activeTab === 'schema' && isAdmin && (
              <div className="space-y-8 animate-in fade-in duration-300">
                  <header>
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Security <span className="text-primary">Audit Log</span></h2>
                      <p className="text-slate-500 text-[10px] font-bold italic opacity-60 uppercase mt-1">Global activity monitoring.</p>
                  </header>
                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-xl">
                      <table className="w-full text-left">
                          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-white/5">
                              <tr>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase italic text-slate-500 tracking-widest">Event</th>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase italic text-slate-500 tracking-widest">Entity</th>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase italic text-slate-500 tracking-widest">Operator</th>
                                  <th className="px-6 py-4 text-[10px] font-black uppercase italic text-slate-500 tracking-widest">Timestamp</th>
                              </tr>
                          </thead>
                          <tbody>
                              {auditLogs.map((log: any) => (
                                  <tr key={log.id} className="border-b border-white/5 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all">
                                      <td className="px-6 py-4">
                                          <div className="text-[11px] font-black italic uppercase text-foreground">{log.r2_key ? 'File Upload' : 'Lead Modified'}</div>
                                          <div className="text-[8px] text-slate-500 font-bold uppercase italic opacity-60 truncate max-w-[200px]">{log.r2_key || 'DB Entry System'}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="text-[11px] font-black italic uppercase text-primary">{log.company_name || 'System Level'}</div>
                                      </td>
                                      <td className="px-6 py-4 text-[10px] font-black italic text-slate-500 uppercase">{log.created_by?.split('@')[0]}</td>
                                      <td className="px-6 py-4 text-[10px] font-black italic text-slate-500 uppercase">{new Date(log.created_at).toLocaleString()}</td>
                                  </tr>
                              ))}
                              {auditLogs.length === 0 && <tr><td colSpan={4} className="text-center py-12 text-slate-500 italic opacity-50 uppercase font-black text-[10px]">No audit history detected on grid.</td></tr>}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {activeTab === 'reports' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                  <header>
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Intelligence <span className="text-primary">Analytics</span></h2>
                      <p className="text-slate-500 text-[10px] font-bold italic opacity-60 uppercase mt-1">Strategic Performance Matrix.</p>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <ReportCard title="Sales Pipeline" val={`$${crmStats.pipe_value?.toLocaleString()}`} trend="+12% weekly" icon={<TrendingUp size={24}/>} />
                      <ReportCard title="Prospects" val={leads.length} trend="Active Scanning" icon={<Search size={24}/>} />
                      <ReportCard title="Conversion" val={`${((crmStats.won_count / (leads.length || 1)) * 100).toFixed(1)}%`} trend="Win Velocity" icon={<DollarSign size={24}/>} />
                  </div>
              </div>
          )}

          {activeTab === 'automation' && isAdmin && (
              <div className="space-y-8 animate-in fade-in duration-300">
                  <header className="flex justify-between items-end">
                      <div>
                          <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">System <span className="text-primary">Automations</span></h2>
                          <p className="text-slate-500 text-[10px] font-bold italic opacity-60 uppercase mt-1">Configure event-driven workflow rules.</p>
                      </div>
                      <button className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-[10px] font-black uppercase italic shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2"><PlusCircle size={14}/> Create Workflow</button>
                  </header>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {workflows.map(wf => (
                          <div key={wf.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-xl space-y-4">
                              <div className="flex justify-between items-start">
                                  <div className="p-3 bg-primary/10 text-primary rounded-2xl"><Zap size={20}/></div>
                                  <button onClick={() => deleteWorkflow(wf.id)} className="p-2 text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                              </div>
                              <div>
                                  <h3 className="text-lg font-black italic uppercase tracking-tighter">{wf.name}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[7px] font-black uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-500 rounded">{wf.trigger_type}</span>
                                      <span className="text-[7px] font-black uppercase px-2 py-0.5 bg-primary/10 text-primary rounded">{wf.action_type}</span>
                                  </div>
                              </div>
                              <p className="text-[10px] text-slate-500 font-bold uppercase italic opacity-60">
                                  If {wf.trigger_type} is {wf.trigger_value}, then {wf.action_type.replace('_', ' ')}.
                              </p>
                          </div>
                      ))}
                      {workflows.length === 0 && <p className="col-span-full text-center py-12 text-slate-500 italic opacity-50 uppercase font-black text-[10px]">No automated workflows active.</p>}
                  </div>
              </div>
          )}

          {activeTab === 'billing' && isAdmin && (
              <div className="space-y-8 animate-in fade-in duration-300">
                  <header>
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Financial <span className="text-primary">Oversight</span></h2>
                      <p className="text-slate-500 text-[10px] font-bold italic opacity-60 uppercase mt-1">Manage subscription and resource usage.</p>
                  </header>
                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-12 rounded-[40px] shadow-xl space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-4">
                              <div className="text-[10px] font-black uppercase text-slate-500 italic tracking-widest pl-1">Active Subscription</div>
                              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-white/5">
                                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-primary">{billingInfo.plan}</h3>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase italic mt-1">{billingInfo.cycle} Billing Cycle</p>
                              </div>
                          </div>
                          <div className="space-y-4">
                              <div className="text-[10px] font-black uppercase text-slate-500 italic tracking-widest pl-1">Next Settlement</div>
                              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-white/5">
                                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">{billingInfo.amount}</h3>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase italic mt-1">Due on {billingInfo.nextBill}</p>
                              </div>
                          </div>
                      </div>
                      <button className="w-full py-4 bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-foreground rounded-2xl text-[10px] font-black uppercase italic transition-all">Access Stripe Customer Portal</button>
                  </div>
              </div>
          )}

        </main>
      </div>

      {/* --- MODALS --- */}
      {isSettingsModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 w-full max-w-md rounded-[40px] p-8 shadow-2xl space-y-8 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Identity <span className="text-primary">Profile</span></h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase italic mt-1">Modify access keys and login credentials.</p>
                    </div>
                    <button onClick={() => setIsSettingsModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-500"><X size={18}/></button>
                  </div>

                  <div className="space-y-6">
                      <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase text-slate-500 italic tracking-widest pl-1">Change Password</label>
                          <div className="space-y-2">
                             <div className="relative">
                                <Lock className="absolute left-3 top-2.5 text-slate-500" size={14}/>
                                <input type="password" placeholder="Current Password" value={settingsData.oldPassword} onChange={e => setSettingsData({...settingsData, oldPassword: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-white/5 rounded-xl p-2.5 pl-10 text-[10px] font-black italic uppercase" />
                             </div>
                             <div className="relative">
                                <Key className="absolute left-3 top-2.5 text-primary" size={14}/>
                                <input type="password" placeholder="New Password" value={settingsData.newPassword} onChange={e => setSettingsData({...settingsData, newPassword: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-white/5 rounded-xl p-2.5 pl-10 text-[10px] font-black italic uppercase border-primary/20" />
                             </div>
                             <button onClick={() => handleSelfUpdate('password')} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase italic shadow-lg shadow-primary/20 transition-all active:scale-95">Update Password</button>
                          </div>
                      </div>

                      <div className="pt-6 border-t border-white/5 space-y-4">
                        <label className="text-[9px] font-black uppercase text-slate-500 italic tracking-widest pl-1">Email Address</label>
                        <div className="relative">
                            <MailIcon className="absolute left-3 top-2.5 text-primary" size={14}/>
                            <input type="email" placeholder="New Email Address" value={settingsData.newEmail} onChange={e => setSettingsData({...settingsData, newEmail: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-white/5 rounded-xl p-2.5 pl-10 text-[10px] font-black italic uppercase border-primary/20" />
                        </div>
                        <button onClick={() => handleSelfUpdate('email')} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase italic shadow-lg shadow-primary/20 transition-all active:scale-95">Update Email</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {isStaffModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <form onSubmit={updateStaff} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 w-full max-w-md rounded-[40px] p-8 shadow-2xl space-y-8 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{targetStaff ? 'Modify' : 'Provision'} <span className="text-primary">Staff</span></h3>
                        <p className="text-[9px] font-bold text-slate-500 uppercase italic mt-1">Personnel Account Management.</p>
                    </div>
                    <button type="button" onClick={() => setIsStaffModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-500"><X size={18}/></button>
                  </div>

                  <div className="space-y-4">
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-black uppercase italic text-slate-500 tracking-widest ml-1">Email Address</span>
                        <input type="email" required value={staffData.email} onChange={e => setStaffData({...staffData, email:e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-white/5 rounded-xl p-3 text-[10px] font-black italic uppercase outline-none focus:border-primary" placeholder="STAFF EMAIL" />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-black uppercase italic text-slate-500 tracking-widest ml-1">{targetStaff ? 'Reset Password (Optional)' : 'Password'}</span>
                        <input type="password" required={!targetStaff} value={staffData.password} onChange={e => setStaffData({...staffData, password:e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-white/5 rounded-xl p-3 text-[10px] font-black italic uppercase outline-none focus:border-primary" placeholder="PASSWORD" />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-black uppercase italic text-slate-500 tracking-widest ml-1">Access Authorization</span>
                        <select value={staffData.role} onChange={e => setStaffData({...staffData, role:e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-white/5 rounded-xl p-3 text-[10px] font-black italic uppercase outline-none focus:border-primary appearance-none">
                            <option value="staff">Standard Staff Ops</option>
                            <option value="admin">Grid Administrator</option>
                        </select>
                      </div>
                  </div>

                  <button type="submit" className="w-full py-4 bg-primary text-primary-foreground rounded-2xl text-[11px] font-black uppercase italic shadow-xl shadow-primary/20 active:scale-95 transition-all">
                      {targetStaff ? 'Authorize Modification' : 'Commission New Personnel'}
                  </button>
              </form>
          </div>
      )}

      {/* --- REUSED KANBAN COMPONENTS --- */}
      {isAddLeadModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 w-full max-w-md rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-2xl font-black italic uppercase tracking-tighter">New <span className="text-primary">Lead Registration</span></h3>
                     <button onClick={() => setIsAddLeadModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-500"><X size={18}/></button>
                  </div>
                  <div className="space-y-4">
                      <input className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-[11px] font-black italic uppercase" placeholder="Company Name" value={newLead.company_name} onChange={e => setNewLead({...newLead, company_name: e.target.value})} />
                      <input className="w-full bg-slate-50 dark:bg-slate-900 border border-white/5 rounded-xl p-3 text-[11px] font-black italic uppercase" placeholder="Website URL" value={newLead.website_url} onChange={e => setNewLead({...newLead, website_url: e.target.value})} />
                      <button onClick={async () => {
                        const token = localStorage.getItem('cb_token');
                        await fetch(`${API_BASE}/crm/leads`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(newLead) });
                        setIsAddLeadModalOpen(false); fetchData();
                      }} className="w-full py-4 bg-primary text-primary-foreground rounded-2xl text-[11px] font-black uppercase italic shadow-xl shadow-primary/20 active:scale-95 transition-all">Register Lead</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}

function SideNavItem({ icon, label, active, onClick }: any) {
    return (
        <div 
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-900/40 hover:text-primary'}`}
        >
            <div className={`${active ? 'text-primary-foreground' : 'group-hover:text-primary'}`}>{icon}</div>
            <span className="font-black italic uppercase text-[9px] tracking-widest">{label}</span>
        </div>
    );
}

function ThemeBtn({ active, onClick, icon, label }: any) {
    return (
        <button 
            onClick={onClick} 
            title={label}
            className={`flex-1 p-1.5 rounded-md flex items-center justify-center transition-all ${active ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 border border-primary/20' : 'text-slate-400 hover:bg-slate-500/10'}`}
        >
            {icon}
        </button>
    );
}

function ReportCard({ title, val, trend, icon }: any) {
    return (
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-8 rounded-[40px] shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-primary group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="text-[10px] font-black uppercase text-slate-500 italic tracking-[0.2em] mb-4">{title}</div>
            <div className="text-6xl font-black italic tracking-tighter text-foreground leading-none">{val}</div>
            <div className="text-[9px] font-bold text-green-500 uppercase italic mt-4 flex items-center gap-1.5">
                <TrendingUp size={10}/> {trend}
            </div>
        </div>
    );
}function KanbanCol({ title, leads, status, onDrop, selectedLeads, onSelect }: any) {
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
                <div className="text-[8px] font-black opacity-30 italic">{leads.length} Prospects</div>
            </div>
            <div className="space-y-3 flex-1">
                {leads.map((l: any) => (
                    <div 
                        key={l.id} 
                        draggable 
                        onDragStart={(e) => e.dataTransfer.setData('leadId', l.id)}
                        className={`bg-white dark:bg-slate-950 border p-4 rounded-xl shadow-md cursor-grab active:cursor-grabbing transition-all group ${selectedLeads.includes(l.id) ? 'border-primary ring-1 ring-primary/20' : 'border-slate-200 dark:border-white/10 hover:border-primary/30'}`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={selectedLeads.includes(l.id)} onChange={() => onSelect(l.id)} className="w-3 h-3 rounded border-white/10 bg-slate-100 dark:bg-slate-900 accent-primary cursor-pointer" />
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${l.ai_score > 80 ? 'bg-red-500/10 text-red-500 font-bold' : 'bg-primary/10 text-primary font-bold'}`}>{l.ai_score} RISK</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <Link to={`/lead/${l.id}`} className="text-slate-400 hover:text-primary"><ChevronRight size={14}/></Link>
                            </div>
                        </div>
                        <h5 className="text-[11px] font-black italic uppercase tracking-tight truncate">{l.company_name}</h5>
                    </div>
                ))}
            </div>
        </div>
    );
}

}
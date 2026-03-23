import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, AlertTriangle, ArrowLeft, Globe, 
  Zap, Cpu, BarChart3, Fingerprint, 
  MessageSquare, Clock, Send, CheckCircle,
  XCircle, UserPlus, Trash2, Mail, Phone,
  Briefcase, CheckSquare, Plus, DollarSign,
  TrendingUp, Award, Rocket, FileText, Upload, HardDrive, 
  Search, ExternalLink, ChevronRight, Activity, Download,
  RefreshCw, Power, LineChart, Gauge
} from 'lucide-react';

const API_BASE = 'https://cloudbase-crm.curtislamasters.workers.dev/api';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = localStorage.getItem('theme') || 'dark';
  const [lead, setLead] = useState<any>(null);
  const [dossier, setDossier] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [vault, setVault] = useState<any[]>([]);
  const [monitorHistory, setMonitorHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRescanning, setIsRescanning] = useState(false);
  
  const [note, setNote] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [newContact, setNewContact] = useState({ first_name: '', last_name: '', title: '', email: '', phone: '' });

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('cb_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [leadRes, dossierRes, activityRes, contactRes, taskRes, vaultRes, monRes] = await Promise.all([
        fetch(`${API_BASE}/crm/leads/${id}`, { headers }),
        fetch(`${API_BASE}/reports/dossier/${id}`, { headers }),
        fetch(`${API_BASE}/crm/activities/${id}`, { headers }),
        fetch(`${API_BASE}/crm/contacts/${id}`, { headers }),
        fetch(`${API_BASE}/crm/tasks/${id}`, { headers }),
        fetch(`${API_BASE}/crm/vault/${id}`, { headers }),
        fetch(`${API_BASE}/crm/monitoring/${id}`, { headers })
      ]);
      
      if (leadRes.status === 401) { navigate('/login'); return; }
      
      if (leadRes.ok) setLead(await leadRes.json());
      const doss = await dossierRes.json();
      setDossier(doss?.dossier);
      if (activityRes.ok) setActivities(await activityRes.json());
      if (contactRes.ok) setContacts(await contactRes.json());
      if (taskRes.ok) setTasks(await taskRes.json());
      if (vaultRes.ok) setVault(await vaultRes.json());
      if (monRes.ok) setMonitorHistory(await monRes.json());
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }, [id, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleMonitoring = async () => {
      const token = localStorage.getItem('cb_token');
      await fetch(`${API_BASE}/crm/monitoring/${id}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: !lead.auto_monitoring_enabled })
      });
      fetchData();
  };

  const triggerRescan = async () => {
      setIsRescanning(true);
      const token = localStorage.getItem('cb_token');
      await fetch(`${API_BASE}/crm/rescan/${id}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
      });
      setIsRescanning(false);
      fetchData();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const token = localStorage.getItem('cb_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lead_id', id || '');

    try {
        const res = await fetch(`${API_BASE}/storage/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        if (res.ok) fetchData();
    } catch (e) {}
    finally { setIsUploading(false); }
  };

  const deleteContact = async (cid: string) => {
      const token = localStorage.getItem('cb_token');
      await fetch(`${API_BASE}/crm/contacts/${cid}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchData();
  };

  const postNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    const token = localStorage.getItem('cb_token');
    await fetch(`${API_BASE}/crm/activities/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'Note', content: note })
    });
    setNote('');
    fetchData();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const token = localStorage.getItem('cb_token');
    await fetch(`${API_BASE}/crm/tasks/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: taskTitle, priority: 'High', due_at: new Date(Date.now() + 86400000).toISOString() })
    });
    setTaskTitle('');
    fetchData();
  };

  const toggleTask = async (taskId: string, current: boolean) => {
    const token = localStorage.getItem('cb_token');
    await fetch(`${API_BASE}/crm/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !current })
    });
    fetchData();
  };
  
  const deleteTask = async (taskId: string) => {
      const token = localStorage.getItem('cb_token');
      await fetch(`${API_BASE}/crm/tasks/${taskId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchData();
  };

  if (isLoading || !lead) return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center">
       <Zap className="text-orange-500 animate-pulse" size={64} />
    </div>
  );

  return (
    <div className={`min-h-screen bg-background font-sans selection:bg-primary/30 overflow-x-hidden text-foreground ${theme}`}>
      
      <div className="max-w-6xl mx-auto p-8 lg:p-12 space-y-12 pb-32">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4 flex-1">
             <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest italic">
                <ArrowLeft size={12}/> Back to Leads
             </Link>
             <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <span className="bg-primary/10 p-2 border border-primary/20 rounded-xl text-primary">
                      <Briefcase size={18} />
                   </span>
                   <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] italic">Lead Reference: {lead.id.split('-')[0].toUpperCase()}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">{lead.company_name}</h1>
                <div className="flex items-center gap-4">
                   <div className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase italic border border-white/5 ${lead.status === 'Won' ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-900 text-slate-500'}`}>
                      {lead.status === 'Won' ? 'SUCCESS' : lead.status}
                   </div>
                   <p className="text-slate-500 text-sm font-bold italic opacity-60 truncate max-width-xs">{lead.website_url}</p>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-6 bg-white dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-xl">
             <div className="text-center">
                <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1 italic">Risk Score</div>
                <div className={`text-5xl font-black italic tracking-tighter leading-none ${lead.ai_score > 80 ? 'text-red-500' : 'text-primary'}`}>{lead.ai_score}</div>
             </div>
             <div className="w-px h-12 bg-slate-200 dark:bg-white/5"></div>
             <div className="text-center">
                <div className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1 italic">Value</div>
                <div className="text-3xl font-black italic tracking-tighter text-foreground leading-none">${lead.deal_value || 0}</div>
             </div>
             {lead.status !== 'Won' && (
                <button 
                    onClick={async () => {
                        const token = localStorage.getItem('cb_token');
                        const res = await fetch(`${API_BASE}/crm/checkout/${id}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
                        const { url } = await res.json();
                        if (url) window.location.href = url;
                    }}
                    className="ml-4 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-[10px] font-black uppercase italic shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                    Generate Agreement
                </button>
             )}
          </div>
        </header>

        {window.location.search.includes('payment=success') && (
            <div className="bg-green-500 text-white p-4 rounded-2xl text-center font-black italic uppercase tracking-widest text-[10px] animate-bounce">
                Mission Success: Commercial Transaction Confirmed.
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          <div className="md:col-span-8 space-y-8">
             {/* Audit Pulse Monitoring Section - Phase 9 */}
             <section className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-8 rounded-3xl space-y-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-orange-500">
                    <LineChart size={80}/>
                </div>
                <div className="flex justify-between items-center relative z-10">
                   <div className="space-y-1">
                      <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3 leading-none">
                         <Activity className="text-primary" size={28} /> Infrastructure <span className="text-primary">Monitor</span>
                      </h2>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest italic">Continuous Infrastructure Verification</p>
                   </div>
                   <div className="flex items-center gap-4">
                       <button onClick={toggleMonitoring} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase italic transition-all ${lead.auto_monitoring_enabled ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 border border-white/5'}`}>
                           <Power size={14}/> {lead.auto_monitoring_enabled ? 'Active' : 'Enable Monitoring'}
                       </button>
                       <button disabled={isRescanning} onClick={triggerRescan} className="bg-primary text-primary-foreground p-2.5 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-all">
                           <RefreshCw size={16} className={isRescanning ? 'animate-spin' : ''} />
                       </button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-white/5">
                            <div className="text-[8px] text-slate-500 uppercase font-black italic mb-4">Last 10 Health Checks</div>
                            <div className="flex items-end gap-2 h-24">
                                {monitorHistory.slice().reverse().map((h: any, i: number) => (
                                    <div key={i} className="flex-1 group relative">
                                        <div 
                                            className={`w-full rounded-t-md transition-all ${h.score > 80 ? 'bg-red-500' : 'bg-orange-500'} opacity-30 hover:opacity-100`} 
                                            style={{ height: `${h.score}%` }}
                                        ></div>
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[7px] p-1 rounded opacity-0 group-hover:opacity-100 transition-all">{h.score}%</div>
                                    </div>
                                ))}
                                {monitorHistory.length === 0 && <div className="w-full flex items-center justify-center text-[8px] font-black uppercase text-slate-500 italic">No telemetry data.</div>}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 flex flex-col justify-center">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase italic">Next Scheduled Pulse</span>
                            <span className="text-[10px] font-black text-foreground italic">{new Date(lead.next_scan_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase italic">Drift Detection</span>
                            <span className="text-[10px] font-black text-green-500 italic">Stable</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase italic">Last Global Scan</span>
                            <span className="text-[10px] font-black text-slate-400 italic">{new Date(lead.last_scanned_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
             </section>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 p-6 rounded-3xl space-y-6 shadow-lg">
                   <h2 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                      <ShieldCheck className="text-red-500" size={24} /> Risks
                   </h2>
                   <div className="space-y-3">
                      {dossier?.vulnerabilities?.map((v: string, i: number) => (
                          <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-white/5 transition-all">
                              <span className="text-red-500 text-base font-black italic opacity-30 leading-none">0{i+1}</span>
                              <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">{v}</p>
                          </div>
                      ))}
                   </div>
                </section>

                <section className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-3xl space-y-6 shadow-lg">
                   <h2 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                      <Cpu className="text-orange-500" size={24} /> AI Intel
                   </h2>
                   <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border-l-8 border-l-orange-500 shadow-xl min-h-[140px]">
                       <p className="text-foreground text-sm italic leading-relaxed font-black tracking-tight underline decoration-orange-500/10 underline-offset-4">
                          "{dossier?.executiveSummary || 'Recalculating Intelligence Grid...'}"
                       </p>
                   </div>
                </section>
             </div>

             {/* R2 Document Vault */}
             <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 p-8 rounded-3xl space-y-8 shadow-xl">
                 <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3 leading-none">
                       <HardDrive className="text-blue-500" size={28} /> Node <span className="text-blue-500">Vault</span>
                    </h2>
                    <label className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg cursor-pointer transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                        {isUploading ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16}/>}
                        <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vault.map((f: any) => (
                        <div key={f.id} className="bg-slate-50 dark:bg-slate-950 border border-white/5 p-4 rounded-xl flex items-center justify-between group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <FileText size={20} className="text-blue-500 flex-shrink-0" />
                                <div className="truncate">
                                    <div className="text-[9px] font-black italic uppercase truncate text-foreground">
                                        {f.r2_key.includes('/') ? f.r2_key.split('/').pop()?.substring(37) : f.r2_key}
                                    </div>
                                    <div className="text-[7px] text-slate-500 font-bold uppercase tracking-widest italic">{new Date(f.created_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <a href={`${API_BASE}/storage/view/${f.r2_key}`} target="_blank" rel="noreferrer" className="p-1.5 opacity-0 group-hover:opacity-100 dark:text-slate-500 hover:text-blue-500 transition-all">
                                <Download size={14}/>
                            </a>
                        </div>
                    ))}
                    {vault.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl">
                            <p className="text-[10px] font-black uppercase text-slate-400 italic">No nodes stored in vault.</p>
                        </div>
                    )}
                 </div>
             </section>

          </div>

          <aside className="md:col-span-4 space-y-8">
             {/* Mission Items */}
             <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 p-6 rounded-3xl space-y-6 shadow-xl">
                <h2 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3 leading-none">
                   <CheckSquare className="text-primary" size={24} /> Task <span className="text-primary">List</span>
                </h2>
                <form onSubmit={handleCreateTask} className="flex gap-2">
                   <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-950 border border-white/5 rounded-xl p-2.5 text-[10px] font-black italic uppercase outline-none focus:border-orange-500" placeholder="New Task..." />
                   <button className="bg-orange-500 text-white p-2.5 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95"><Plus size={16}/></button>
                </form>
                <div className="space-y-3">
                   {tasks.map((t: any) => (
                     <div key={t.id} className="flex gap-4 items-center group p-3 bg-slate-50 dark:bg-slate-950 border border-white/5 rounded-xl transition-all">
                        <button onClick={() => toggleTask(t.id, t.completed)} className={`w-5 h-5 rounded-md flex items-center justify-center border border-white/10 transition-all ${t.completed ? 'bg-orange-500 border-none animate-in zoom-in' : 'bg-slate-800'}`}>
                           {t.completed && <CheckCircle size={12} className="text-white"/>}
                        </button>
                        <span className={`text-[10px] font-black italic uppercase leading-none flex-1 truncate ${t.completed ? 'text-slate-600 line-through' : 'text-foreground'}`}>{t.title}</span>
                        <button onClick={() => deleteTask(t.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 transition-all"><XCircle size={13}/></button>
                     </div>
                   ))}
                </div>
             </section>

             {/* Node History */}
             <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 p-6 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
                <h2 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3 leading-none">
                   <Clock className="text-slate-500" size={24} /> Node <span className="text-slate-500">History</span>
                </h2>
                <form onSubmit={postNote} className="flex gap-2">
                   <input value={note} onChange={e => setNote(e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-950 border border-white/5 rounded-xl p-2.5 text-[10px] font-black italic uppercase outline-none focus:border-slate-500" placeholder="Log node activity..." />
                   <button className="bg-slate-200 dark:bg-slate-800 text-foreground p-2.5 rounded-xl active:scale-95"><Send size={16}/></button>
                </form>
                <div className="space-y-6 relative border-l border-slate-100 dark:border-white/10 ml-2 pl-6">
                   {activities.map((a: any) => (
                     <div key={a.id} className="relative">
                        <div className="absolute -left-[33px] top-0 w-4 h-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                        </div>
                        <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest italic mb-1 opacity-50">{new Date(a.created_at).toLocaleString()}</div>
                        <p className="text-[10px] font-bold text-slate-400 italic leading-relaxed">{a.content}</p>
                     </div>
                   ))}
                </div>
             </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: any) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[8px] font-black uppercase italic text-slate-500 tracking-widest ml-1">{label}</span>
            <input 
                className="bg-slate-50 dark:bg-slate-950 border border-white/10 p-2.5 rounded-xl w-full text-[10px] font-black italic uppercase outline-none focus:border-orange-500 transition-all shadow-inner"
                value={value} onChange={e => onChange(e.target.value)}
                placeholder={`ENTER ${label.toUpperCase()}`}
            />
        </div>
    );
}
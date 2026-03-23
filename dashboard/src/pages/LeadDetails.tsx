import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, AlertTriangle, ArrowLeft, Globe, 
  Zap, Cpu, BarChart3, Fingerprint, 
  MessageSquare, Clock, Send, CheckCircle,
  XCircle, UserPlus, Trash2, Mail, Phone,
  Briefcase, CheckSquare, Plus, DollarSign,
  TrendingUp, Award, Rocket
} from 'lucide-react';

const API_BASE = 'https://cloudbase-crm.curtislamasters.workers.dev/api';
const STAGES = ['Discovery', 'Contacted', 'Proposal', 'Won', 'Lost'];

export default function LeadDetails() {
  const { id } = useParams();
  const [lead, setLead] = useState<any>(null);
  const [dossier, setDossier] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [note, setNote] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [newContact, setNewContact] = useState({ first_name: '', last_name: '', title: '', email: '', phone: '' });

  const fetchData = async () => {
    const token = localStorage.getItem('cb_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [leadsRes, dossierRes, activityRes, contactRes, taskRes] = await Promise.all([
        fetch(`${API_BASE}/leads`, { headers }),
        fetch(`${API_BASE}/reports/dossier/${id}`, { headers }),
        fetch(`${API_BASE}/crm/activities/${id}`, { headers }),
        fetch(`${API_BASE}/crm/contacts/${id}`, { headers }),
        fetch(`${API_BASE}/crm/tasks/${id}`, { headers })
      ]);
      const leads = await leadsRes.json();
      setLead(leads.find((l: any) => l.id === id));
      const doss = await dossierRes.json();
      setDossier(doss?.dossier);
      setActivities(await activityRes.json());
      setContacts(await contactRes.json());
      setTasks(await taskRes.json());
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const updateStage = async (status: string) => {
    setIsUpdating(true);
    const token = localStorage.getItem('cb_token');
    await fetch(`${API_BASE}/crm/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
    setIsUpdating(false);
  };

  const convertToCustomer = async () => {
    setIsUpdating(true);
    const token = localStorage.getItem('cb_token');
    await fetch(`${API_BASE}/crm/convert/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 1500, stripe_id: `cus_${crypto.randomUUID().slice(0, 8)}` })
    });
    fetchData();
    setIsUpdating(false);
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('cb_token');
    await fetch(`${API_BASE}/crm/contacts/${id}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(newContact)
    });
    setNewContact({ first_name: '', last_name: '', title: '', email: '', phone: '' });
    setShowContactForm(false);
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

  if (isLoading || !lead) return (
    <div className="min-h-screen bg-[#020617] flex justify-center items-center">
       <Zap className="text-orange-500 animate-pulse shadow-3xl shadow-orange-500/10" size={120} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] p-12 lg:p-24 font-sans selection:bg-orange-500/30 overflow-x-hidden">
      
      <div className="max-w-7xl mx-auto space-y-20 pb-48">
        
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-16">
          <div className="space-y-12 flex-1">
             <Link to="/" className="inline-flex items-center gap-4 text-slate-700 hover:text-orange-500 transition-all font-black text-xs uppercase tracking-[0.4em] italic leading-none underline decoration-slate-900 underline-offset-8">COMMAND RAIL NODE</Link>
             <div className="space-y-6">
                <div className="flex items-center gap-6">
                   <span className="bg-orange-500/10 p-4 border border-orange-500/30 rounded-3xl text-orange-500">
                      <Rocket size={28} />
                   </span>
                   <span className="text-slate-600 text-sm font-black uppercase tracking-widest italic underline decoration-slate-900 underline-offset-4 decoration-2">Mission ID: {lead.id.split('-')[0].toUpperCase()}</span>
                </div>
                <h1 className="text-9xl font-black text-white italic tracking-tighter uppercase leading-[0.8]">{lead.company_name}</h1>
                <div className="flex items-center gap-6 translate-x-2">
                   <div className={`px-10 py-3.5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] italic border border-white/5 shadow-2xl ${lead.status === 'Won' ? 'bg-green-500 text-white' : 'bg-slate-950 text-slate-500'}`}>
                      {lead.status === 'Won' ? 'MISSION SUCCESS' : lead.status}
                   </div>
                   <p className="text-slate-500 text-lg font-bold italic tracking-tight">{lead.website_url.replace('https://', '')}</p>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-6 w-full xl:w-[400px]">
             <div className="bg-slate-950 border border-white/10 p-16 rounded-[4.5rem] text-center shadow-3xl relative overflow-hidden group">
                {lead.status === 'Won' && <div className="absolute inset-0 bg-green-500/5 backdrop-blur-3xl animate-pulse"></div>}
                <div className="text-xs text-slate-700 uppercase font-black tracking-[0.6em] mb-4 italic leading-none">Risk Index assessment</div>
                <div className={`text-[10rem] font-black italic tracking-tighter leading-none mb-4 ${lead.ai_score > 80 ? 'text-red-500 drop-shadow-[0_0_50px_rgba(239,68,68,0.4)]' : 'text-orange-500'}`}>
                  {lead.ai_score}
                </div>
                <div className="text-[10px] text-slate-600 font-extrabold uppercase tracking-[0.8em] tracking-tighter italic">Built Networks Entropy-Sync</div>
             </div>
             {lead.status !== 'Won' && (
                <button 
                  onClick={convertToCustomer}
                  className="w-full bg-green-600 text-white font-black py-6 rounded-[2.5rem] hover:bg-green-500 transition-all italic text-xl uppercase tracking-tighter shadow-3xl shadow-green-500/20 active:scale-95 flex items-center justify-center gap-4"
                >
                   <Award size={28}/> CONVERT PROSPECT
                </button>
             )}
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
          
          <div className="xl:col-span-8 space-y-16">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <section className="bg-slate-900/10 border border-white/5 p-12 rounded-[3.5rem] space-y-12">
                   <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-5">
                      <ShieldCheck className="text-red-500" size={40} /> Surface Risks
                   </h2>
                   <div className="space-y-8">
                      {dossier?.vulnerabilities?.map((v: string, i: number) => (
                          <div key={i} className="flex gap-8 items-start p-8 bg-slate-950/40 border-l-[10px] border-red-500/20 rounded-[2.5rem] hover:border-red-500/40 transition-all">
                              <span className="text-red-500 text-2xl font-black italic opacity-30">0{i+1}</span>
                              <p className="text-slate-400 font-bold leading-relaxed text-sm italic">{v}</p>
                          </div>
                      ))}
                   </div>
                </section>

                <section className="bg-orange-500/5 border border-orange-500/10 p-12 rounded-[3.5rem] space-y-12">
                   <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-5">
                      <Cpu className="text-orange-500" size={40} /> AI Logic-Dossier
                   </h2>
                   <div className="bg-slate-950/80 p-12 rounded-[2.5rem] border-l-[15px] border-l-orange-500 shadow-2xl relative">
                       <p className="text-white text-xl italic leading-[2.2] font-black tracking-tight underline decoration-orange-500/10 underline-offset-8">
                          "{dossier?.executiveSummary || 'Recalculating...'}"
                       </p>
                       <Zap className="absolute -top-4 -right-4 text-orange-500 fill-orange-500/20" size={40}/>
                   </div>
                </section>
             </div>

             <section className="bg-slate-900/10 border border-white/5 p-16 rounded-[4.5rem] space-y-12">
                <div className="flex justify-between items-center border-b border-white/5 pb-10">
                   <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-5">
                      <Briefcase className="text-blue-500" size={40} /> Human Layer
                   </h2>
                   <button onClick={() => setShowContactForm(!showContactForm)} className="bg-blue-500 p-4 rounded-[1.5rem] text-white hover:scale-110 transition-transform"><UserPlus size={24}/></button>
                </div>
                {showContactForm && (
                   <form onSubmit={handleCreateContact} className="bg-slate-950 border border-white/5 p-12 rounded-[3rem] gap-6 grid grid-cols-2 animate-in fade-in duration-500">
                      <input value={newContact.first_name} onChange={e => setNewContact({...newContact, first_name: e.target.value})} className="bg-slate-900 border-none rounded-2xl p-5 text-white font-black italic" placeholder="First Name" />
                      <input value={newContact.last_name} onChange={e => setNewContact({...newContact, last_name: e.target.value})} className="bg-slate-900 border-none rounded-2xl p-5 text-white font-black italic" placeholder="Last Name" />
                      <input value={newContact.title} onChange={e => setNewContact({...newContact, title: e.target.value})} className="bg-slate-900 border-none rounded-2xl p-5 text-white font-black italic" placeholder="Job Title" />
                      <input value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} className="bg-slate-900 border-none rounded-2xl p-5 text-white font-black italic" placeholder="Corporate Email" />
                      <div className="col-span-2 flex justify-end gap-10 mt-6 border-t border-white/5 pt-8">
                         <button type="button" onClick={() => setShowContactForm(false)} className="text-slate-600 font-black italic uppercase text-xs">ABORT IDENTITY LOG</button>
                         <button type="submit" className="bg-blue-500 text-white px-12 py-4 rounded-3xl font-black italic uppercase text-xs tracking-widest shadow-2xl shadow-blue-500/20">SAVE TO MISSION</button>
                      </div>
                   </form>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   {contacts.map(c => (
                      <div key={c.id} className="bg-slate-950 border border-white/5 p-10 rounded-[3.5rem] relative group hover:border-blue-500/40 transition-all border-l-[12px] border-l-blue-500/20">
                         <div className="flex justify-between items-center mb-8">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 font-black text-2xl italic leading-none">{c.first_name[0]}</div>
                            <Trash2 size={24} className="text-slate-800 hover:text-red-500 transition-all cursor-pointer"/>
                         </div>
                         <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-3">{c.first_name} {c.last_name}</h3>
                         <p className="text-blue-500 text-xs font-black uppercase tracking-[0.3em] mb-10 italic">{c.title || 'Decision Maker'}</p>
                         <div className="space-y-4 pt-10 border-t border-white/5">
                            <div className="flex items-center gap-4 text-slate-500 text-sm font-bold italic"><Mail size={16}/> {c.email || 'Email missing'}</div>
                            <div className="flex items-center gap-4 text-slate-500 text-sm font-bold italic"><Phone size={16}/> {c.phone || 'Phone missing'}</div>
                         </div>
                      </div>
                   ))}
                </div>
             </section>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <section className="bg-slate-900/10 border border-white/5 p-12 rounded-[4rem] space-y-12">
                   <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-5">
                      <CheckSquare className="text-green-500" size={40} /> Mission Checklist
                   </h2>
                   <form onSubmit={handleCreateTask} className="flex gap-4">
                      <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="flex-1 bg-slate-950 border border-white/5 rounded-3xl p-5 text-white font-black italic text-xs uppercase" placeholder="New Mission Item..." />
                      <button className="bg-green-500 text-white p-5 rounded-3xl shadow-xl shadow-green-500/20"><Plus size={24}/></button>
                   </form>
                   <div className="space-y-6">
                      {tasks.map(t => (
                        <div key={t.id} onClick={() => toggleTask(t.id, t.completed)} className="flex gap-6 items-center group cursor-pointer p-6 bg-slate-950/40 rounded-[2rem] border border-white/5 hover:border-green-500/30 transition-all">
                           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border border-white/5 transition-all ${t.completed ? 'bg-green-500 border-none' : 'bg-slate-900'}`}>
                              {t.completed && <CheckCircle size={20} className="text-white"/>}
                           </div>
                           <span className={`text-sm font-black italic uppercase leading-tight flex-1 ${t.completed ? 'text-slate-700 line-through' : 'text-slate-300'}`}>{t.title}</span>
                        </div>
                      ))}
                   </div>
                </section>

                <section className="bg-slate-900/10 border border-white/5 p-12 rounded-[4rem] space-y-12">
                   <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase flex items-center gap-5">
                      <Clock className="text-orange-500" size={40} /> Temporal Log
                   </h2>
                   <form onSubmit={postNote} className="flex gap-4">
                      <input value={note} onChange={e => setNote(e.target.value)} className="flex-1 bg-slate-950 border border-white/5 rounded-3xl p-5 text-white font-black italic text-xs uppercase" placeholder="Note intelligence..." />
                      <button className="bg-orange-500 text-white p-5 rounded-3xl shadow-xl shadow-orange-500/20"><Send size={24}/></button>
                   </form>
                   <div className="space-y-10 pt-10 relative border-l border-white/5 ml-4 pl-12">
                      {activities.map(a => (
                        <div key={a.id} className="relative group">
                           <div className="absolute -left-[68px] top-0 w-12 h-12 bg-slate-950 border border-white/5 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                              <MessageSquare size={22}/>
                           </div>
                           <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic mb-2">{new Date(a.created_at).toLocaleString()}</p>
                           <p className="text-slate-400 font-bold leading-relaxed italic text-sm">{a.content}</p>
                        </div>
                      ))}
                   </div>
                </section>
             </div>
          </div>

          <aside className="xl:col-span-4 space-y-16">
             <div className="bg-slate-950 border border-white/10 rounded-[5rem] p-16 space-y-16 shadow-3xl h-fit border-r-[15px] border-r-orange-500/10">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-[0.2em] border-b border-white/10 pb-10">Financial intelligence</h3>
                <div className="space-y-12">
                   <FinanceRow label="Deal Value" value={`$${lead.deal_value || 0}`} active />
                   <FinanceRow label="Stage" value={lead.status} />
                   <FinanceRow label="Customer ID" value={lead.stripe_customer_id || 'NOT CONVERTED'} />
                </div>
                <div className="pt-10 flex flex-col gap-6 border-t border-white/5">
                   <button className="w-full bg-slate-900 border border-white/5 text-white font-black py-6 rounded-[2.5rem] italic text-xs uppercase tracking-widest flex items-center justify-center gap-4">
                      <DollarSign size={20} className="text-green-500"/> VIEW FINANCIAL LEDGER
                   </button>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function FinanceRow({ label, value, active }: any) {
  return (
    <div className="flex justify-between items-center group">
       <span className="text-xs text-slate-600 font-black uppercase tracking-widest italic">{label}</span>
       <span className={`text-xl font-black italic uppercase transition-all ${active ? 'text-green-500' : 'text-slate-300 group-hover:text-white'}`}>{value}</span>
    </div>
  );
}
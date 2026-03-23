import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, ArrowLeft, Globe, Zap, Cpu, BarChart3, Fingerprint } from 'lucide-react';

const API_BASE = 'https://cloudbase-crm.curtislamasters.workers.dev/api';

export default function LeadDetails() {
  const { id } = useParams();
  const [lead, setLead] = useState<any>(null);
  const [dossier, setDossier] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cb_token');
    
    // 1. Fetch Basic Lead Info
    fetch(`${API_BASE}/leads`, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => {
        const found = data.find((l: any) => l.id === id);
        setLead(found);
        
        // 2. Fetch AI Intelligence Dossier
        if (found) {
            return fetch(`${API_BASE}/reports/dossier/${id}`, { headers: { 'Authorization': `Bearer ${token}` }});
        }
      })
      .then(res => res?.json())
      .then(data => {
        if (data?.dossier) setDossier(data.dossier);
      })
      .catch(err => console.error("Dossier Error", err))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading || !lead) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-6">
        <Zap className="text-orange-500 animate-pulse" size={64} />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Assembling Intelligent Dossier...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] p-8 lg:p-12 font-sans selection:bg-orange-500/30">
      
      <div className="max-w-6xl mx-auto space-y-12">
        <Link to="/" className="inline-flex items-center gap-3 text-slate-500 hover:text-orange-500 mb-4 transition-all group font-bold text-sm uppercase tracking-widest">
            <div className="p-2 bg-slate-950 rounded-xl group-hover:bg-orange-500 transition-colors">
               <ArrowLeft size={18} className="group-hover:text-white" />
            </div>
            Back to Command Rail
        </Link>

        {/* Header Profile */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 rounded-full bg-orange-500/5 text-orange-500 text-[9px] font-black uppercase tracking-[0.3em] border border-orange-500/20 shadow-2xl shadow-orange-500/10">
                Strategic Intelligence Profile
              </span>
              <span className="text-slate-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <Fingerprint size={14}/> ID: {lead.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase">{lead.company_name}</h1>
            <p className="text-slate-400 text-xl font-medium flex items-center gap-3 italic">
              <Globe className="text-orange-500" size={24} /> {lead.website_url}
            </p>
          </div>
          
          <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem] text-center min-w-[220px] shadow-2xl shadow-black group hover:border-orange-500/30 transition-all duration-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
               <BarChart3 className="text-orange-500" size={64}/>
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Technical Debt Score</div>
            <div className={`text-7xl font-black italic ${lead.ai_score > 80 ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'text-orange-500'}`}>
              {lead.ai_score}
            </div>
            <div className="text-[8px] text-slate-600 font-extrabold uppercase mt-2 tracking-[0.5em]">Risk Index Assessment</div>
          </div>
        </header>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
          
          {/* 1. Vulnerability Analysis */}
          <section className="bg-slate-900/30 border border-white/5 p-10 rounded-[3rem] space-y-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/5 blur-[120px] pointer-events-none rounded-full"></div>
             <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-4">
                <ShieldCheck className="text-red-500" size={32} /> Infrastructure Vulnerabilities
             </h2>
             <div className="space-y-6">
                {dossier?.vulnerabilities ? dossier.vulnerabilities.map((v: string, i: number) => (
                    <div key={i} className="flex gap-6 items-start p-6 bg-slate-950/60 border border-white/5 rounded-3xl hover:border-red-500/30 transition-all">
                        <div className="text-red-500 text-lg font-black italic pt-1">0{i+1}.</div>
                        <p className="text-slate-300 font-bold leading-relaxed">{v}</p>
                    </div>
                )) : (
                    <div className="animate-pulse space-y-4">
                        <div className="h-20 bg-white/5 rounded-3xl"></div>
                        <div className="h-20 bg-white/5 rounded-3xl"></div>
                    </div>
                )}
             </div>
          </section>

          {/* 2. Executive MSP Pitch */}
          <section className="bg-orange-500/5 border border-orange-500/20 p-10 rounded-[3rem] space-y-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/10 blur-[120px] pointer-events-none rounded-full"></div>
             <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-4">
                <Zap className="text-orange-500" size={32} /> MSP Sales Strategy
             </h2>
             <div className="space-y-8 relative z-10">
                <div className="bg-slate-950/40 p-10 rounded-3xl border border-white/5 border-l-orange-500 border-l-4">
                    <p className="text-slate-300 text-lg italic leading-[1.8] font-medium">
                       "{dossier?.executiveSummary || 'Recalculating Strategic Overview...'}"
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                   <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                      <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2 italic">Recovery Estimate</div>
                      <div className="text-2xl font-black text-white italic uppercase">{dossier?.estimatedRecoveryTime || '7-14 Days'}</div>
                   </div>
                   <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5">
                      <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2 italic">Sales Leverage</div>
                      <div className="text-2xl font-black text-orange-500 italic uppercase">High Margin</div>
                   </div>
                </div>

                <div className="pt-6">
                    <button className="w-full bg-white text-black font-black py-6 rounded-[2rem] hover:bg-orange-500 hover:text-white transition-all shadow-2xl shadow-white/5 flex items-center justify-center gap-4 active:scale-[0.98]">
                        <Cpu size={24}/> AUTO-GENERATE PITCH DECK
                    </button>
                    <p className="text-center text-slate-600 text-[10px] uppercase font-black tracking-widest mt-4">Powered by Llama 3.1 Inference Engine • Built Networks</p>
                </div>
             </div>
          </section>

        </div>
      </div>
    </div>
  );
}
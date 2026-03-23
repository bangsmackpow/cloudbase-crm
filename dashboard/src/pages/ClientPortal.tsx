import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, Zap, Globe, Gauge, Activity, BarChart3, Clock, AlertTriangle } from 'lucide-react';

const API_BASE = 'https://cloudbase-crm.curtislamasters.workers.dev/api';

export default function ClientPortal() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/portal/${id}`)
      .then(res => res.json())
      .then(d => { setData(d); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-4">
          <Zap className="text-orange-500 animate-pulse" size={48} />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Decrypting Infrastructure Nodes...</p>
      </div>
  );

  if (!data?.lead) return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-4">
          <AlertTriangle className="text-red-500" size={48} />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Node Access Revoked or Non-Existent.</p>
      </div>
  );

  const { lead, history } = data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-orange-500/30 text-foreground overflow-x-hidden">
      
      {/* 🛡️ Header */}
      <nav className="border-b border-slate-200 dark:border-white/5 bg-background/50 backdrop-blur-xl px-8 py-6 sticky top-0 z-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-lg shadow-xl shadow-orange-500/20">
                  <ShieldCheck size={18} className="text-white" />
              </div>
              <h1 className="text-xs font-black tracking-widest uppercase italic leading-none">CLOUDBASE <span className="text-orange-500">CLIENT PORTAL</span></h1>
          </div>
          <div className="hidden md:flex items-center gap-6">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-full italic">Encrypted Connection</span>
          </div>
      </nav>

      <main className="max-w-4xl mx-auto p-8 md:p-16 space-y-12 pb-32">
          
          <header className="space-y-6 text-center md:text-left">
              <div className="space-y-2">
                  <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Infrastructure Health Dossier</p>
                  <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">{lead.company_name}</h2>
                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 pt-4">
                      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold italic opacity-60">
                          <Globe size={14}/> {lead.website_url}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase italic tracking-widest">
                          <Clock size={14}/> Node Last Scanned: {new Date(lead.last_scanned_at).toLocaleDateString()}
                      </div>
                  </div>
              </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              <div className="md:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-[40px] flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative z-10 text-center space-y-4">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic mb-2">Technical Health Index</div>
                      <div className={`text-8xl font-black italic tracking-tighter leading-none ${lead.ai_score > 80 ? 'text-red-500' : 'text-orange-500'}`}>{lead.ai_score}</div>
                      <div className="text-foreground text-[10px] font-black uppercase italic tracking-widest">
                          {lead.ai_score > 80 ? 'High Risk Optimization Recommended' : 'Standard Infrastructure Performance'}
                      </div>
                  </div>
              </div>

              <div className="md:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-[40px] space-y-8 shadow-2xl">
                  <h3 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                      <Activity size={24} className="text-orange-500"/> Performance <span className="text-orange-500">Telemetry</span>
                  </h3>
                  
                  <div className="space-y-4">
                      <div className="flex justify-between items-end h-32 gap-3">
                          {history.slice().reverse().map((h: any, i: number) => (
                              <div key={i} className="flex-1 flex flex-col gap-2 items-center group">
                                  <div 
                                      className="w-full bg-orange-500/20 rounded-xl transition-all group-hover:bg-orange-500/50"
                                      style={{ height: `${h.score}%` }}
                                  ></div>
                                  <span className="text-[7px] font-black text-slate-500 uppercase italic leading-none">{new Date(h.scanned_at).toLocaleDateString()}</span>
                              </div>
                          ))}
                          {history.length === 0 && <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase text-slate-500 italic border-2 border-dashed border-white/5 rounded-3xl">Collecting Telemetry Data...</div>}
                      </div>
                  </div>
              </div>
          </div>

          <section className="bg-orange-500 border border-orange-600 p-12 rounded-[50px] text-white shadow-2xl relative overflow-hidden">
              <Zap className="absolute -bottom-8 -right-8 text-white/10" size={300} />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                    <BarChart3 size={32}/>
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Strategic <span className="text-slate-900/40">Recommendations</span></h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/10">
                        <h4 className="text-[10px] font-black uppercase italic mb-2 tracking-widest text-white/50">Urgent Logic</h4>
                        <p className="text-lg font-bold italic leading-tight">Infrastructure performance optimization to reduce latency by 15-20% minimum.</p>
                    </div>
                    <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/10">
                        <h4 className="text-[10px] font-black uppercase italic mb-2 tracking-widest text-white/50">Security Posture</h4>
                        <p className="text-lg font-bold italic leading-tight">Implement Cloudflare SSL/TLS 1.3 to harden front-facing endpoints against SSL-debt.</p>
                    </div>
                </div>
              </div>
          </section>

          <footer className="pt-24 text-center border-t border-slate-200 dark:border-white/5 opacity-50 space-y-4">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] italic text-slate-500">Autonomous Infrastructure Analysis Provided By Built Networks</p>
              <div className="flex justify-center gap-8">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
          </footer>

      </main>
    </div>
  );
}

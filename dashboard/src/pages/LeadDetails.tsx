import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, ArrowLeft, Globe, Zap, Cpu } from 'lucide-react';

export default function LeadDetails() {
  const { id } = useParams();
  const [lead, setLead] = useState<any>(null);

  useEffect(() => {
    fetch(`https://cloudbase-crm.curtislamasters.workers.dev/api/leads`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((l: any) => l.id === id);
        setLead(found);
      });
  }, [id]);

  if (!lead) return <div className="p-20 text-center text-slate-500">Loading Security Profile...</div>;

  return (
    <div className="min-h-screen bg-[#020617] p-6 lg:p-12">
      <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-orange-500 mb-8 transition-colors">
        <ArrowLeft size={18} /> Back to Command Center
      </Link>

      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-wider border border-orange-500/20">
                Technical Audit
              </span>
            </div>
            <h1 className="text-4xl font-black text-white">{lead.company_name}</h1>
            <p className="text-slate-400 text-lg flex items-center gap-2 mt-2">
              <Globe size={18} /> {lead.website_url}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl text-center min-w-[160px]">
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Risk Score</div>
            <div className={`text-5xl font-black ${lead.ai_score > 80 ? 'text-red-500' : 'text-orange-500'}`}>
              {lead.ai_score}
            </div>
          </div>
        </header>

        {/* Audit Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Findings Card */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
              <Zap className="text-orange-500" /> AI Vulnerability Analysis
            </h2>
            <div className="space-y-6 text-slate-300 leading-relaxed">
              <p>Based on initial edge-scanning, this prospect shows significant infrastructure debt.</p>
              <ul className="space-y-4">
                <RiskItem label="Insecure SSL Configuration" risk="High" />
                <RiskItem label="Mobile Performance Bottleneck" risk="Medium" />
                <RiskItem label="Exposed DNS Metadata" risk="Low" />
              </ul>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-orange-600/5 border border-orange-500/20 p-8 rounded-3xl">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
              <Cpu className="text-orange-500" /> Executive Recommendation
            </h2>
            <p className="text-slate-400 mb-8">
              "This business is a prime candidate for Managed Services. Their local SEO is strong, but their infrastructure is a liability."
            </p>
            <button className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-xl shadow-orange-500/10">
              Generate PDF Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskItem({ label, risk }: { label: string, risk: string }) {
  return (
    <li className="flex justify-between items-center border-b border-slate-800 pb-3 last:border-0">
      <span className="text-slate-200">{label}</span>
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
        risk === 'High' ? 'bg-red-500/10 text-red-500' : 
        risk === 'Medium' ? 'bg-orange-500/10 text-orange-500' : 'bg-green-500/10 text-green-500'
      }`}>
        {risk}
      </span>
    </li>
  );
}
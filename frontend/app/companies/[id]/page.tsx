"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Shield, Target, Users, BarChart, Globe, Linkedin, ArrowLeft, ExternalLink } from 'lucide-react';
import SynthesisStatus from '@/components/SynthesisStatus';

interface Founder {
    id: number;
    name: string;
    role: string | null;
    linkedin_url: string | null;
    bio: string | null;
}

interface Company {
    id: number;
    name: string;
    logo_url: string | null;
    website: string | null;
    one_liner: string | null;
    description: string | null;
    problem: string | null;
    source: string;
    batch: string | null;
    industry: string | null;
    location: string | null;
    funding_raised: string | null;
    team_size: number | null;
    founded_at: string | null;
    founders: Founder[];
}

export default function CompanyDetail() {
    const { id } = useParams();
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/companies/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setCompany(data);
                }
            } catch (error) {
                console.error('Error fetching company:', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchCompany();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
            <div className="w-12 h-12 border-t-2 border-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Accessing Local Intelligence Node...</p>
        </div>
    );

    if (!company) return (
        <div className="flex justify-center items-center h-screen bg-slate-50 text-slate-900 font-black uppercase tracking-widest border border-slate-200">
            Node Error: Intelligence Stream Null
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-100">
            <div className="max-w-6xl mx-auto">
                <nav className="mb-12 flex justify-between items-center bg-white/60 p-4 rounded-3xl border border-slate-200 backdrop-blur-xl shadow-sm">
                    <Link href="/" className="text-slate-500 hover:text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-3 group">
                        <span className="p-2 rounded-xl bg-slate-100 group-hover:bg-indigo-50 transition-colors"><ArrowLeft className="w-4 h-4" /></span>
                        Return to Intelligence Pool
                    </Link>
                    <div className="flex items-center gap-6">
                        <span className={`text-[10px] font-black border px-4 py-2 rounded-xl uppercase tracking-[0.2em] ${company.source === 'YC' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                            company.source === 'StartX' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
                                'bg-purple-50 text-purple-600 border-purple-100'
                            }`}>
                            Origin: {company.source}
                        </span>
                        <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:inline">
                            Telemetry ID: {company.id}
                        </span>
                    </div>
                </nav>

                <div className="relative">
                    {/* Decorative pulse */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

                    <div className="glass rounded-[3.5rem] overflow-hidden border-slate-200 shadow-xl bg-white/60 backdrop-blur-3xl">
                        {/* Hero Section */}
                        <div className="bg-slate-50/50 px-12 py-20 border-b border-slate-100">
                            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
                                <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-10">
                                    <div className="relative group">
                                        <div className="absolute -inset-4 bg-indigo-500/10 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        {company.logo_url ? (
                                            <div className="w-32 h-32 rounded-[2.5rem] bg-white border border-slate-200 p-6 shadow-md relative group-hover:shadow-xl transition-shadow">
                                                <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 flex items-center justify-center text-slate-300 font-black text-5xl border border-slate-200 border-dashed relative">
                                                {company.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">
                                            {company.name}
                                        </h1>
                                        <div className="pt-2">
                                            {company.one_liner ? (
                                                <p className="text-2xl text-gradient font-bold italic opacity-90 leading-tight">
                                                    "{company.one_liner}"
                                                </p>
                                            ) : (
                                                <SynthesisStatus label="Environmental Assessment In Progress" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-12 grid grid-cols-1 lg:grid-cols-3 gap-20">
                            {/* Detailed Forensics (Left) */}
                            <div className="lg:col-span-2 space-y-20">
                                <section>
                                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                                        <Target className="w-4 h-4 text-indigo-500" />
                                        Strategic Intelligence
                                    </h2>
                                    <div className="bg-slate-100/50 p-10 rounded-[3rem] text-slate-700 leading-relaxed font-medium text-xl border border-slate-100 italic relative overflow-hidden">
                                        <Shield className="absolute top-0 right-0 p-8 text-slate-200 w-32 h-32 opacity-20 pointer-events-none" />
                                        {company.problem ? (
                                            <p className="relative z-10">{company.problem}</p>
                                        ) : (
                                            <div className="relative z-10">
                                                <SynthesisStatus label="Accessing Proprietary Strategy Set..." />
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                                        <BarChart className="w-4 h-4 text-indigo-500" />
                                        Briefing Overview
                                    </h2>
                                    {company.description ? (
                                        <p className="text-slate-500 leading-loose text-lg font-medium">
                                            {company.description}
                                        </p>
                                    ) : (
                                        <SynthesisStatus label="Aggregating Full Forensics Profile..." />
                                    )}
                                </section>

                                <section>
                                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                                        <Users className="w-4 h-4 text-indigo-500" />
                                        High-Value Assets (Founders)
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        {company.founders.map((founder) => (
                                            <div key={founder.id} className="glass p-10 rounded-[2.5rem] border-slate-200 hover:border-indigo-300 transition-all group relative overflow-hidden bg-white/40">
                                                <h3 className="text-2xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{founder.name}</h3>
                                                <p className="font-black text-[10px] text-indigo-500 uppercase tracking-[0.2em] mb-6">{founder.role || "Operator"}</p>
                                                {founder.bio && <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-4">{founder.bio}</p>}
                                                {founder.linkedin_url && (
                                                    <a
                                                        href={founder.linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] hover:text-indigo-600 transition-all border-b border-indigo-100 pb-1"
                                                    >
                                                        <Linkedin className="w-3 h-3" />
                                                        Verify Trace &rarr;
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Metrics (Right) */}
                            <div className="lg:col-span-1">
                                <div className="glass p-10 rounded-[3rem] sticky top-12 border-slate-200 shadow-lg bg-white/80 backdrop-blur-2xl">
                                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-12">Operational Metrics</h2>

                                    <div className="space-y-10">
                                        <div className="p-6 rounded-2.5xl bg-slate-50 border border-slate-100">
                                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Capitalization</span>
                                            <span className="text-3xl font-black text-slate-900">
                                                {company.funding_raised || "UNDISCLOSED"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-6 rounded-2.5xl bg-slate-50 border border-slate-100">
                                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Cycle</span>
                                                <span className="text-lg font-black text-slate-900">{company.batch || "N/A"}</span>
                                            </div>
                                            <div className="p-6 rounded-2.5xl bg-slate-50 border border-slate-100">
                                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Units</span>
                                                <span className="text-lg font-black text-slate-900">{company.team_size || "?"} OPS</span>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-2.5xl bg-slate-50 border border-slate-100">
                                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Vertical</span>
                                            <span className="text-lg font-black text-indigo-600 uppercase tracking-widest">{company.industry || "GENERAL"}</span>
                                        </div>

                                        <div className="p-6 rounded-2.5xl bg-slate-50 border border-slate-100">
                                            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Inception</span>
                                            <span className="text-lg font-black text-slate-900">{company.founded_at || "N/A"}</span>
                                        </div>
                                    </div>

                                    <div className="mt-16 space-y-4">
                                        {company.website && (
                                            <div className="space-y-4">
                                                <a
                                                    href={company.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block w-full text-center bg-indigo-600 hover:bg-slate-900 text-white font-black py-6 rounded-2.5xl transition-all shadow-md hover:shadow-xl uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-2 group"
                                                >
                                                    <Globe className="w-4 h-4" />
                                                    Initialize Hub
                                                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                                </a>
                                                <a
                                                    href={company.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block text-center text-[10px] text-slate-400 font-bold hover:text-indigo-600 transition-colors truncate px-4"
                                                >
                                                    {company.website.replace(/^https?:\/\/(www\.)?/, '')}
                                                </a>
                                            </div>
                                        )}
                                        <button className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 font-black py-6 rounded-2.5xl transition-all border border-slate-200 uppercase tracking-[0.3em] text-[10px]">
                                            Export Dossier
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

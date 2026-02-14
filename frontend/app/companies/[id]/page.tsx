"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

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
                const res = await fetch(`http://localhost:8000/companies/${id}`);
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
        <div className="flex flex-col justify-center items-center h-screen bg-black">
            <div className="w-12 h-12 border-t-2 border-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs">Accessing intelligence stream...</p>
        </div>
    );

    if (!company) return (
        <div className="flex justify-center items-center h-screen bg-black text-white font-black uppercase tracking-widest border border-white/10">
            Signal Lost: Intelligence Null
        </div>
    );

    return (
        <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8 selection:bg-purple-500/30">
            <div className="max-w-6xl mx-auto">
                <nav className="mb-12 flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-xl">
                    <Link href="/" className="text-gray-400 hover:text-cyan-400 font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-3">
                        <span className="p-2 rounded-lg bg-white/5">←</span>
                        Back to Intelligence Pool
                    </Link>
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-purple-400 border border-purple-500/20 px-4 py-2 rounded-xl bg-purple-500/5 uppercase tracking-[0.2em]">
                            Source: {company.source}
                        </span>
                        <div className="h-6 w-[1px] bg-white/10"></div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest hidden md:inline">
                            Ref: {company.id}
                        </span>
                    </div>
                </nav>

                <div className="relative">
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

                    <div className="glass rounded-[3.5rem] overflow-hidden border-white/5 shadow-2xl">
                        {/* Hero Header */}
                        <div className="bg-white/[0.02] px-12 py-20 border-b border-white/5">
                            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
                                <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-10">
                                    <div className="relative group">
                                        <div className="absolute -inset-4 bg-cyan-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        {company.logo_url ? (
                                            <img src={company.logo_url} alt={company.name} className="w-32 h-32 rounded-[2.5rem] object-contain bg-white/5 border border-white/10 p-4 relative" />
                                        ) : (
                                            <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 flex items-center justify-center text-white/10 font-black text-5xl border border-white/10 border-dashed relative">
                                                {company.name[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
                                            {company.name}
                                        </h1>
                                        <p className="text-2xl text-gradient font-bold italic opacity-90 leading-tight">
                                            "{company.one_liner || "Strategic intelligence synthesis in progress."}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-12 grid grid-cols-1 lg:grid-cols-3 gap-20">
                            {/* Detailed Intelligence (Left) */}
                            <div className="lg:col-span-2 space-y-20">
                                <section>
                                    <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                                        <span className="w-8 h-[1px] bg-cyan-500/30"></span>
                                        Core Problem & Solution
                                    </h2>
                                    <div className="bg-white/5 p-10 rounded-[3rem] text-gray-300 leading-relaxed font-medium text-xl border border-white/5 italic relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 text-white/5 text-6xl group-hover:text-cyan-500/10 transition-colors">🎯</div>
                                        <p className="relative z-10">{company.problem || "Accessing proprietary problem set..."}</p>
                                    </div>
                                </section>

                                <section>
                                    <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-8 flex items-center gap-4">
                                        <span className="w-8 h-[1px] bg-cyan-500/30"></span>
                                        Intelligence Overview
                                    </h2>
                                    <p className="text-gray-400 leading-loose text-lg font-medium bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
                                        {company.description || "Aggregating full company profile from distributed signals..."}
                                    </p>
                                </section>

                                <section>
                                    <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                                        <span className="w-8 h-[1px] bg-cyan-500/30"></span>
                                        Leadership Node
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        {company.founders.map((founder) => (
                                            <div key={founder.id} className="glass p-10 rounded-[2.5rem] border-white/5 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
                                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl"></div>
                                                <h3 className="text-2xl font-black text-white mb-1 group-hover:text-cyan-400 transition-colors">{founder.name}</h3>
                                                <p className="font-black text-[10px] text-purple-400 uppercase tracking-[0.2em] mb-6">{founder.role || "Founder"}</p>
                                                {founder.bio && <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-4">{founder.bio}</p>}
                                                {founder.linkedin_url && (
                                                    <a
                                                        href={founder.linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-[0.2em] group-hover:text-cyan-400 transition-all border-b border-white/10 pb-1"
                                                    >
                                                        LinkedIn Identity &rarr;
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Vital Stats (Right) */}
                            <div className="lg:col-span-1">
                                <div className="glass p-12 rounded-[3.5rem] sticky top-12 border-white/5 shadow-2xl overflow-hidden backdrop-blur-2xl">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl pointer-events-none">📊</div>
                                    <h2 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-12">Vital Intelligence</h2>

                                    <div className="space-y-12">
                                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Capital Status</span>
                                            <span className="text-3xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">
                                                {company.funding_raised || "UNDISCLOSED"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                                <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Program</span>
                                                <span className="text-lg font-black text-white">{company.batch || "N/A"}</span>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                                <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Operations</span>
                                                <span className="text-lg font-black text-white">{company.team_size || "?"} Units</span>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Industry Vertical</span>
                                            <span className="text-lg font-black text-indigo-400 uppercase tracking-widest">{company.industry || "GENERAL"}</span>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                            <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Inception</span>
                                            <span className="text-lg font-black text-white">{company.founded_at || "N/A"}</span>
                                        </div>
                                    </div>

                                    <div className="mt-16 space-y-4">
                                        {company.website && (
                                            <a
                                                href={company.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block w-full text-center bg-white hover:bg-cyan-400 text-black font-black py-6 rounded-3xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-cyan-400/20 uppercase tracking-[0.3em] text-[10px]"
                                            >
                                                Initialize Network Hub
                                            </a>
                                        )}
                                        <button className="block w-full text-center bg-white/5 hover:bg-white/10 text-white/40 hover:text-white font-black py-6 rounded-3xl transition-all border border-white/5 uppercase tracking-[0.3em] text-[10px]">
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

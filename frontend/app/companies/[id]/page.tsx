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

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-400 font-black uppercase tracking-widest">Loading intelligence...</div>;
    if (!company) return <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-900 font-black">Intelligence not found.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <nav className="mb-10 flex justify-between items-center">
                    <Link href="/" className="text-gray-400 hover:text-indigo-600 font-black uppercase tracking-widest text-xs transition-colors flex items-center gap-2">
                        &larr; Back to Intelligence Pool
                    </Link>
                    <span className="text-[10px] font-black text-indigo-400 border border-indigo-200 px-3 py-1 rounded-full uppercase tracking-widest">
                        SECURE REPORT: {company.id}
                    </span>
                </nav>

                <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
                    {/* Hero Section */}
                    <div className="bg-white px-10 py-16 border-b border-gray-50">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                            <div className="flex items-center gap-8">
                                {company.logo_url ? (
                                    <img src={company.logo_url} alt={company.name} className="w-24 h-24 rounded-3xl object-contain bg-white border border-gray-100 shadow-md" />
                                ) : (
                                    <div className="w-24 h-24 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300 font-black text-4xl border-2 border-dashed border-gray-100">
                                        {company.name[0]}
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none mb-4">{company.name}</h1>
                                    <p className="text-xl text-indigo-600 font-medium italic">
                                        "{company.one_liner || "Intelligence report in progress..."}"
                                    </p>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest ${company.source === 'YC' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                    company.source === 'StartX' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                        'bg-purple-50 text-purple-600 border border-purple-100'
                                }`}>
                                {company.source}
                            </span>
                        </div>
                    </div>

                    <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-16">
                        {/* Left Column: Details */}
                        <div className="lg:col-span-2 space-y-16">
                            <section>
                                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Core Problem</h2>
                                <div className="bg-gray-50 p-8 rounded-[2rem] text-gray-800 leading-relaxed font-medium text-lg border border-gray-100 italic">
                                    {company.problem || "Information not yet enriched."}
                                </div>
                            </section>

                            <section>
                                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Intelligence Overview</h2>
                                <p className="text-gray-600 leading-loose text-lg font-medium">{company.description || "Aggregating full company profile..."}</p>
                            </section>

                            <section>
                                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8">Management Team</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    {company.founders.map((founder) => (
                                        <div key={founder.id} className="border border-gray-50 p-8 rounded-[2rem] bg-gray-50/30 hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all group">
                                            <h3 className="text-xl font-black text-gray-900 mb-1">{founder.name}</h3>
                                            <p className="font-black text-[10px] text-indigo-400 uppercase tracking-widest mb-4">{founder.role || "Founder"}</p>
                                            {founder.bio && <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-4">{founder.bio}</p>}
                                            {founder.linkedin_url && (
                                                <a
                                                    href={founder.linkedin_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-block text-gray-900 font-black text-[10px] uppercase tracking-widest border-b-2 border-indigo-200 group-hover:border-indigo-600 transition-colors"
                                                >
                                                    LinkedIn Trace &rarr;
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Stats */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-900 p-10 rounded-[3rem] sticky top-8 text-white shadow-2xl overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-9xl">📊</div>
                                <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-10">Vital Metrics</h2>
                                <div className="space-y-10">
                                    <div>
                                        <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Funding Status</span>
                                        <span className="text-2xl font-black text-green-400">💰 {company.funding_raised || "UNDISCLOSED"}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Batch</span>
                                            <span className="text-lg font-black">{company.batch || "N/A"}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Team</span>
                                            <span className="text-lg font-black">{company.team_size || "?"} OPS</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Industry</span>
                                        <span className="text-lg font-black text-indigo-300 uppercase tracking-tight">{company.industry || "GENERAL"}</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Founded</span>
                                        <span className="text-lg font-black">{company.founded_at || "N/A"}</span>
                                    </div>
                                </div>

                                <div className="mt-12 pt-10 border-t border-gray-800">
                                    {company.website && (
                                        <a
                                            href={company.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/20 uppercase tracking-[0.2em] text-xs"
                                        >
                                            Visit Network Hub
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

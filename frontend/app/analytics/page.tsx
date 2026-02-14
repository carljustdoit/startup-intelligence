'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ArrowLeft, BarChart3, Users, Target, Activity, Search, Globe, ChevronRight } from 'lucide-react';

interface Company {
    id: number;
    name: string;
    one_liner: string;
    industry: string;
    source: string;
    funding_raised: string;
    logo_url: string;
    website: string;
}

interface AnalyticsData {
    industry_distribution: { industry: string; count: number }[];
    total_companies: number;
    source_distribution: { source: string; count: number }[];
}

const COLORS = ['#7c3aed', '#0891b2', '#2563eb', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

export default function Analytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
    const [industryCompanies, setIndustryCompanies] = useState<Company[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:8000/analytics');
                const result = await res.json();
                setData(result);
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchIndustryCompanies = async (industry: string) => {
        try {
            const params = new URLSearchParams({ size: '50', search: industry });
            const res = await fetch(`http://localhost:8000/companies?${params.toString()}`);
            const result = await res.json();
            // Client-side filter to be precise
            const filtered = result.items.filter((c: Company) => c.industry === industry || (c.industry === null && industry === 'General'));
            setIndustryCompanies(filtered);
        } catch (error) {
            console.error("Fetch industry companies error:", error);
        }
    };

    const onPieClick = (_: any, index: number) => {
        if (!data) return;
        const industry = data.industry_distribution[index].industry;
        setActiveIndex(index);
        setSelectedIndustry(industry);
        fetchIndustryCompanies(industry);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
            <div className="w-12 h-12 border-t-2 border-indigo-600 rounded-full animate-spin mb-8"></div>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Processing Ecosystem Intelligence...</p>
        </div>
    );

    const chartData = data?.industry_distribution.map(item => ({
        name: item.industry || 'General',
        value: item.count
    })) || [];

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-100">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Navigation */}
                <nav className="flex justify-between items-center bg-white/60 p-4 rounded-3xl border border-slate-200 backdrop-blur-xl shadow-sm">
                    <Link href="/" className="text-slate-500 hover:text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-3 group">
                        <span className="p-2 rounded-xl bg-slate-100 group-hover:bg-indigo-50 transition-colors"><ArrowLeft className="w-4 h-4" /></span>
                        Exit to Intelligence Pool
                    </Link>
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl glass border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                        <Activity className="w-3 h-3" />
                        <span>Real-time Ecosystem Forensics</span>
                    </div>
                </nav>

                {/* Header */}
                <div className="text-center space-y-4 py-10">
                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter">
                        Ecosystem <span className="text-indigo-600">Forensics.</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                        Vertical Intelligence Distribution across Spectral Cohorts (2024-2026).
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass p-10 rounded-[3rem] border-slate-200 bg-white/40">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Intelligence Units</span>
                        <span className="text-6xl font-black text-slate-900">{data?.total_companies}</span>
                    </div>
                    <div className="glass p-10 rounded-[3rem] border-slate-200 bg-white/40">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Market Verticals</span>
                        <span className="text-6xl font-black text-indigo-600">{data?.industry_distribution.length}</span>
                    </div>
                    <div className="glass p-10 rounded-[3rem] border-slate-200 bg-white/40 overflow-hidden relative group">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Primary Origin</span>
                        <span className="text-6xl font-black text-slate-900">YC</span>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Interactive Pie Chart */}
                    <div className="glass p-12 rounded-[3.5rem] border-slate-200 bg-white/60 min-h-[600px] flex flex-col justify-center relative">
                        <div className="absolute top-8 left-12">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                                <Target className="w-4 h-4 text-indigo-500" />
                                Vertical Concentration
                            </h2>
                            <p className="text-slate-900 font-black text-xl">Interactive Pie Distribution</p>
                        </div>

                        <div className="h-[400px] w-full mt-12">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={140}
                                        paddingAngle={5}
                                        dataKey="value"
                                        onClick={onPieClick}
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                stroke={activeIndex === index ? '#000' : 'none'}
                                                strokeWidth={2}
                                                className="cursor-pointer transition-all duration-300 hover:opacity-80"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                            borderRadius: '20px',
                                            border: '1px solid #e2e8f0',
                                            fontWeight: '900',
                                            fontSize: '12px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em'
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="text-center mt-10">
                            <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">
                                Select a slice to drill down into company dossiers
                            </p>
                        </div>
                    </div>

                    {/* Drill-down List */}
                    <div className="glass rounded-[3.5rem] border-slate-200 bg-white/60 p-12 flex flex-col h-[600px]">
                        <div className="mb-8 flex justify-between items-end">
                            <div>
                                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-indigo-500" />
                                    Drill-Down Dossier
                                </h2>
                                <p className="text-slate-900 font-black text-2xl">
                                    {selectedIndustry ? selectedIndustry : "Awaiting Selection..."}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                            {!selectedIndustry ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30 grayscale">
                                    <Search className="w-16 h-16 text-slate-300" />
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                                        Select an industry slice from the distribution chart to synchronize unit data.
                                    </p>
                                </div>
                            ) : industryCompanies.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Zero units located in this sector cohort.</p>
                                </div>
                            ) : (
                                industryCompanies.map((company) => (
                                    <Link
                                        key={company.id}
                                        href={`/companies/${company.id}`}
                                        className="block p-6 rounded-3xl bg-white/60 border border-slate-100 hover:border-indigo-300 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-center gap-6">
                                            {company.logo_url ? (
                                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 p-2 shadow-sm shrink-0">
                                                    <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 font-black text-lg border border-slate-100 border-dashed shrink-0">
                                                    {company.name[0]}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">
                                                    {company.name}
                                                </h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">
                                                    {company.one_liner || "Strategic assessment..."}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </main>
    );
}

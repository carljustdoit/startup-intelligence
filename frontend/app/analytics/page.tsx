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

const INDUSTRY_MAP: Record<string, string> = {
    // Core AI
    'AI': 'Core AI & ML',
    'AI & ML': 'Core AI & ML',
    'ARTIFICIAL INTELLIGENCE': 'Core AI & ML',
    'AIOPS': 'Core AI & ML',
    'NATURAL LANGUAGE PROCESSING': 'Core AI & ML',
    'NLP foundations': 'Core AI & ML',
    'DEEP LEARNING': 'Core AI & ML',

    // Enterprise & SaaS
    'B2B': 'Enterprise & SaaS',
    'SAAS': 'Enterprise & SaaS',
    'HR': 'Enterprise & SaaS',
    'SALES': 'Enterprise & SaaS',
    'LEGAL': 'Enterprise & SaaS',
    'CRM': 'Enterprise & SaaS',
    'DEVELOPER TOOLS': 'Enterprise & SaaS',
    'PRODUCTIVITY': 'Enterprise & SaaS',
    'ENTERPRISE SOFTWARE': 'Enterprise & SaaS',
    'MARKETING': 'Enterprise & SaaS',
    'COLLABORATION': 'Enterprise & SaaS',

    // Fintech
    'PAYMENTS': 'Fintech',
    'BANKING': 'Fintech',
    'CRYPTO': 'Fintech',
    'INSURANCE': 'Fintech',
    'CONSUMER FINANCE': 'Fintech',
    'FINANCE': 'Fintech',
    'FINTECH': 'Fintech',
    'CRYPTOCURRENCY': 'Fintech',
    'WEB3': 'Fintech',

    // Health & Biotech
    'HEALTHCARE': 'Health & Biotech',
    'BIOTECH': 'Health & Biotech',
    'MEDTECH': 'Health & Biotech',
    'WELLNESS': 'Health & Biotech',
    'HEALTHTECH': 'Health & Biotech',
    'BIOTECHNOLOGY': 'Health & Biotech',
    'HEALTHCARE IT': 'Health & Biotech',

    // Energy & Climate
    'CLEAN ENERGY': 'Energy & Climate',
    'SUSTAINABILITY': 'Energy & Climate',
    'CLEANTECH': 'Energy & Climate',
    'FUEL CELLS': 'Energy & Climate',
    'RENEWABLES': 'Energy & Climate',
    'ENERGY': 'Energy & Climate',

    // Logistics & Mobility
    'TRANSPORTATION': 'Logistics & Mobility',
    'LOGISTICS': 'Logistics & Mobility',
    'DRONES': 'Logistics & Mobility',
    'AEROSPACE': 'Logistics & Mobility',
    'AUTOMOTIVE': 'Logistics & Mobility',
    'SUPPLY CHAIN': 'Logistics & Mobility',

    // Space
    'SPACE': 'Space',
    'SATELLITE TECH': 'Space',
    'SPACE EXPLORATION': 'Space',
    'SPACE OPS': 'Space',

    // Industrial & Hard Tech
    'ROBOTICS': 'Industrial & Hard Tech',
    'HARDWARE': 'Industrial & Hard Tech',
    'IOT': 'Industrial & Hard Tech',
    'MANUFACTURING': 'Industrial & Hard Tech',
    'HARD TECH': 'Industrial & Hard Tech',
    'ADVANCED MANUFACTURING': 'Industrial & Hard Tech',

    // Consumer
    'E-COMMERCE': 'Consumer',
    'ENTERTAINMENT': 'Consumer',
    'SOCIAL': 'Consumer',
    'FOOD TECH': 'Consumer',
    'CONSUMER': 'Consumer',
    'RETAIL': 'Consumer',
    'EDUCATION': 'Consumer',
    'EDTECH': 'Consumer'
};

const getCategory = (industry: string | null): string => {
    if (!industry) return 'General';
    // Check primary vertical (first in comma separated list)
    const primary = industry.split(',')[0].trim().toUpperCase();
    return INDUSTRY_MAP[primary] || 'General';
};

const COLORS = ['#7c3aed', '#0891b2', '#2563eb', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

export default function Analytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'category' | 'industry'>('category');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
    const [industryCompanies, setIndustryCompanies] = useState<Company[]>([]);

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

    const fetchCategoryCompanies = async (label: string, mode: 'category' | 'industry') => {
        try {
            // For simplicity, we search by label
            const params = new URLSearchParams({ size: '100', search: label });
            const res = await fetch(`http://localhost:8000/companies?${params.toString()}`);
            const result = await res.json();

            let filtered = [];
            if (mode === 'industry') {
                const isGeneral = label.toUpperCase() === 'GENERAL';
                filtered = result.items.filter((c: Company) => {
                    if (isGeneral) {
                        return !c.industry || c.industry.toUpperCase().includes('GENERAL');
                    }
                    return c.industry?.toUpperCase().includes(label.toUpperCase());
                });
            } else {
                filtered = result.items.filter((c: Company) =>
                    getCategory(c.industry) === label
                );
            }
            setIndustryCompanies(filtered);
        } catch (error) {
            console.error("Fetch companies error:", error);
        }
    };

    const onPieClick = (_: any, index: number) => {
        if (!data) return;

        if (viewMode === 'category') {
            const category = categoryData[index].name;
            setViewMode('industry');
            setActiveCategory(category);
            setActiveIndex(null); // Reset for sub-view
            setSelectedLabel(category);
            // Don't fetch companies yet, just show industry sub-breakdown
            setIndustryCompanies([]);
        } else {
            const industry = industryData[index].name;
            setActiveIndex(index);
            setSelectedLabel(industry);
            fetchCategoryCompanies(industry, 'industry');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
            <div className="w-12 h-12 border-t-2 border-indigo-600 rounded-full animate-spin mb-8"></div>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Processing Ecosystem Intelligence...</p>
        </div>
    );

    // Group industries into categories
    const categoryCounts: Record<string, number> = {};
    data?.industry_distribution.forEach(item => {
        const cat = getCategory(item.industry);
        categoryCounts[cat] = (categoryCounts[cat] || 0) + item.count;
    });

    const categoryData = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }));

    // Industries within the active category
    const industryData = data?.industry_distribution
        .filter(item => getCategory(item.industry) === activeCategory)
        .map(item => ({
            name: item.industry || 'General',
            value: item.count
        })) || [];

    const chartData = viewMode === 'category' ? categoryData : industryData;

    return (
        <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 selection:bg-indigo-100">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Navigation */}
                <nav className="flex justify-between items-center bg-white/60 p-4 rounded-3xl border border-slate-200 backdrop-blur-xl shadow-sm">
                    <Link href="/" className="text-slate-500 hover:text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-3 group">
                        <span className="p-2 rounded-xl bg-slate-100 group-hover:bg-indigo-50 transition-colors"><ArrowLeft className="w-4 h-4" /></span>
                        Exit to Intelligence Pool
                    </Link>
                    <div className="flex gap-4">
                        {viewMode === 'industry' && (
                            <button
                                onClick={() => { setViewMode('category'); setActiveCategory(null); setSelectedLabel(null); setIndustryCompanies([]); }}
                                className="px-4 py-2 rounded-xl glass border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-600 transition-all"
                            >
                                Back to Categories
                            </button>
                        )}
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl glass border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                            <Activity className="w-3 h-3" />
                            <span>Real-time Ecosystem Forensics</span>
                        </div>
                    </div>
                </nav>

                {/* Header */}
                <div className="text-center space-y-4 py-10">
                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter">
                        Ecosystem <span className="text-indigo-600">Forensics.</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                        {viewMode === 'category' ? 'Strategic Cohort Distribution' : `Vertical Concentration in ${activeCategory}`}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass p-10 rounded-[3rem] border-slate-200 bg-white/40">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Intelligence Units</span>
                        <span className="text-6xl font-black text-slate-900">{data?.total_companies}</span>
                    </div>
                    <div className="glass p-10 rounded-[3rem] border-slate-200 bg-white/40">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Focus Verticals</span>
                        <span className="text-6xl font-black text-indigo-600">{chartData.length}</span>
                    </div>
                    <div className="glass p-10 rounded-[3rem] border-slate-200 bg-white/40 overflow-hidden relative group">
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Primary Path</span>
                        <span className="text-6xl font-black text-slate-900">{viewMode === 'category' ? 'GLOBAL' : 'SEC-01'}</span>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* Interactive Pie Chart */}
                    <div className="glass p-12 rounded-[3.5rem] border-slate-200 bg-white/60 min-h-[600px] flex flex-col relative transition-all duration-500">
                        <div className="mb-12">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                                <Target className="w-4 h-4 text-indigo-500" />
                                {viewMode === 'category' ? 'Market Overview' : `${activeCategory} Breakdown`}
                            </h2>
                            <p className="text-slate-900 font-black text-xl">Interactive Pie Distribution</p>
                        </div>

                        <div className="h-[400px] w-full">
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
                                {viewMode === 'category' ? 'Click category to subdivide sectors' : 'Select industry to view company list'}
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
                                    {selectedLabel ? selectedLabel : "Awaiting Selection..."}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-4 space-y-4 custom-scrollbar">
                            {!selectedLabel || (viewMode === 'industry' && !activeIndex) ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30 grayscale">
                                    <Search className="w-16 h-16 text-slate-300" />
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                                        {viewMode === 'category'
                                            ? "Select a market cohort from the distribution chart to subdivide results."
                                            : "Select a specific vertical to synchronize unit data."}
                                    </p>
                                </div>
                            ) : industryCompanies.length === 0 ? (
                                <div className="h-full flex items-center justify-center flex-col gap-4">
                                    <Activity className="w-12 h-12 text-indigo-100 animate-pulse" />
                                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Synching unit dossiers...</p>
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

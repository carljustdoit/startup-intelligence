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
    // Core AI & ML
    'AI': 'Core AI & ML',
    'AI & ML': 'Core AI & ML',
    'ARTIFICIAL INTELLIGENCE': 'Core AI & ML',
    'COMPUTER VISION': 'Core AI & ML',
    'CONVERSATIONAL AI': 'Core AI & ML',
    'DATA LABELING': 'Core AI & ML',
    'DATA SCIENCE': 'Core AI & ML',
    'GENERATIVE AI': 'Core AI & ML',
    'MACHINE LEARNING': 'Core AI & ML',
    'REINFORCEMENT LEARNING': 'Core AI & ML',
    'SPEECH RECOGNITION': 'Core AI & ML',
    'DEEP LEARNING': 'Core AI & ML',
    'NLP foundations': 'Core AI & ML',
    'NATURAL LANGUAGE PROCESSING': 'Core AI & ML',
    'AIOPS': 'Core AI & ML',

    // Fintech
    'FINTECH': 'Fintech',
    'FINANCE': 'Fintech',
    'PAYMENTS': 'Fintech',
    'BANKING': 'Fintech',
    'CRYPTO': 'Fintech',
    'INSURANCE': 'Fintech',
    'CONSUMER FINANCE': 'Fintech',
    'CRYPTOCURRENCY': 'Fintech',
    'WEB3': 'Fintech',
    'CRYPTO / WEB3': 'Fintech',
    'BILLING': 'Fintech',
    'LENDING': 'Fintech',
    'NEOBANK': 'Fintech',
    'REGTECH': 'Fintech',

    // Enterprise & SaaS
    'SAAS': 'Enterprise & SaaS',
    'B2B': 'Enterprise & SaaS',
    'DEVELOPER TOOLS': 'Enterprise & SaaS',
    'ENTERPRISE SOFTWARE': 'Enterprise & SaaS',
    'CRM': 'Enterprise & SaaS',
    'ANALYTICS': 'Enterprise & SaaS',
    'API': 'Enterprise & SaaS',
    'AUTOMATION': 'Enterprise & SaaS',
    'BIG DATA': 'Enterprise & SaaS',
    'CALENDAR': 'Enterprise & SaaS',
    'CALL CENTER': 'Enterprise & SaaS',
    'CLOUD COMPUTING': 'Enterprise & SaaS',
    'COMPLIANCE': 'Enterprise & SaaS',
    'CUSTOMER SUCCESS': 'Enterprise & SaaS',
    'CUSTOMER SUPPORT': 'Enterprise & SaaS',
    'DATA ENGINEERING': 'Enterprise & SaaS',
    'DESIGN': 'Enterprise & SaaS',
    'DESIGN TOOLS': 'Enterprise & SaaS',
    'DOCUMENTS': 'Enterprise & SaaS',
    'GEOGRAPHIC INFORMATION SYSTEM': 'Enterprise & SaaS',
    'HR TECH': 'Enterprise & SaaS',
    'HUMAN RESOURCES': 'Enterprise & SaaS',
    'LEGAL': 'Enterprise & SaaS',
    'LEGALTECH': 'Enterprise & SaaS',
    'MARKETING': 'Enterprise & SaaS',
    'OPEN SOURCE': 'Enterprise & SaaS',
    'OPERATIONS': 'Enterprise & SaaS',
    'PRODUCTIVITY': 'Enterprise & SaaS',
    'RECRUITING': 'Enterprise & SaaS',
    'WEB DEVELOPMENT': 'Enterprise & SaaS',
    'WORKFLOW AUTOMATION': 'Enterprise & SaaS',
    'COLLABORATION': 'Enterprise & SaaS',

    // Consumer
    'CONSUMER': 'Consumer',
    'E-COMMERCE': 'Consumer',
    'MARKETPLACE': 'Consumer',
    'MEDIA': 'Consumer',
    'PODCASTS': 'Consumer',
    'REAL ESTATE': 'Consumer',
    'SEARCH': 'Consumer',
    'SOCIAL NETWORK': 'Consumer',
    'VIDEO': 'Consumer',
    'ENTERTAINMENT': 'Consumer',
    'SOCIAL': 'Consumer',
    'RETAIL': 'Consumer',
    'CHAT': 'Consumer',
    'CONSUMER PRODUCTS': 'Consumer',

    // Health & Biotech
    'HEALTHCARE': 'Health & Biotech',
    'BIOTECHNOLOGY': 'Health & Biotech',
    'HEALTHCARE IT': 'Health & Biotech',
    'HEALTHTECH': 'Health & Biotech',
    'MEDTECH': 'Health & Biotech',
    'WELLNESS': 'Health & Biotech',
    'BIOTECH': 'Health & Biotech',
    'LIVESTOCK HEALTH': 'Health & Biotech',

    // Industrial & Hard Tech
    'HARD TECH': 'Industrial & Hard Tech',
    'HARDWARE': 'Industrial & Hard Tech',
    'ROBOTICS': 'Industrial & Hard Tech',
    'IOT': 'Industrial & Hard Tech',
    'MANUFACTURING': 'Industrial & Hard Tech',
    'ADVANCED MANUFACTURING': 'Industrial & Hard Tech',
    'CONSTRUCTION': 'Industrial & Hard Tech',
    'IOT & ADVANCED MANUFACTURING': 'Industrial & Hard Tech',

    // Logistics & Mobility
    'TRANSPORTATION': 'Logistics & Mobility',
    'LOGISTICS': 'Logistics & Mobility',
    'AEROSPACE': 'Logistics & Mobility',
    'AUTOMOTIVE': 'Logistics & Mobility',
    'DRONES': 'Logistics & Mobility',
    'SUPPLY CHAIN': 'Logistics & Mobility',
    'MARITIME': 'Logistics & Mobility',

    // Energy & Climate
    'ENERGY': 'Energy & Climate',
    'SUSTAINABILITY': 'Energy & Climate',
    'CLEANTECH': 'Energy & Climate',
    'RENEWABLES': 'Energy & Climate',
    'FUEL CELLS': 'Energy & Climate',
    'SUSTAINABLE AGRICULTURE': 'Energy & Climate',
    'FOOD & AG': 'Energy & Climate',

    // Education
    'EDTECH': 'Education',
    'EDUCATION': 'Education',
    'AI-ENHANCED LEARNING': 'Education',

    // Space
    'SPACE': 'Space',
    'SATELLITE TECH': 'Space',
    'SPACE EXPLORATION': 'Space',
    'SPACE OPS': 'Space'
};

const getCategory = (industry: string | null): string => {
    if (!industry) return 'General';
    // Check primary vertical (first in comma separated list)
    const primary = industry.split(',')[0].trim().toUpperCase();
    return INDUSTRY_MAP[primary] || 'General';
};

const COLORS = [
    '#7c3aed', '#0891b2', '#2563eb', '#f59e0b', '#10b981', '#ef4444', '#ec4899',
    '#8b5cf6', '#06b6d4', '#3b82f6', '#fbbf24', '#34d399', '#f87171', '#f472b6',
    '#a78bfa', '#22d3ee', '#60a5fa', '#fb923c', '#4ade80', '#fb7185', '#fb923c',
    '#c084fc', '#67e8f9', '#93c5fd', '#fdba74', '#86efac', '#fda4af', '#fda4af'
];

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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/analytics`);
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
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/companies?${params.toString()}`);
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

    const handleCategorySelection = (category: string) => {
        // Redundant check: if all sub-items would map to "Other"
        const rawMatches = data?.industry_distribution.filter(item => getCategory(item.industry) === category) || [];
        const uniqueSubs = new Set(rawMatches.map(m => {
            const n = m.industry || 'Other';
            const isRedundant = n.toUpperCase() === 'GENERAL' || n.toUpperCase() === 'OTHER' || n.toUpperCase() === category.toUpperCase();
            return isRedundant ? 'Other' : n;
        }));

        if (uniqueSubs.size === 1 && uniqueSubs.has('Other')) {
            // Flatten: go straight to dossier for simple categories
            setViewMode('category');
            setActiveCategory(category);
            setSelectedLabel(category);
            fetchCategoryCompanies(category, 'category');
        } else {
            setViewMode('industry');
            setActiveCategory(category);
            setActiveIndex(null);
            setSelectedLabel(category);
            setIndustryCompanies([]);
        }
    };

    const onPieClick = (_: any, index: number) => {
        if (!data) return;

        if (viewMode === 'category') {
            const category = categoryData[index].name;
            handleCategorySelection(category);
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

    // Industries within the active category - Normalized to "Other" if redundant
    const industryDataRaw: Record<string, number> = {};
    data?.industry_distribution
        .filter(item => getCategory(item.industry) === activeCategory)
        .forEach(item => {
            const rawName = item.industry || 'Other';
            const isRedundant = rawName.toUpperCase() === 'GENERAL' || rawName.toUpperCase() === 'OTHER' || rawName.toUpperCase() === (activeCategory || '').toUpperCase();
            const name = isRedundant ? 'Other' : rawName;
            industryDataRaw[name] = (industryDataRaw[name] || 0) + item.count;
        });

    const industryData = Object.entries(industryDataRaw)
        .sort((a, b) => b[1] - a[1])
        .filter(([name]) => name.toUpperCase() !== (activeCategory || '').toUpperCase()) // Remove parent slice
        .map(([name, value]) => ({ name, value }));

    const chartData = viewMode === 'category' ? categoryData : industryData;

    const handleLegendClick = (props: any) => {
        const { value } = props;
        const index = chartData.findIndex(d => d.name === value);
        if (index !== -1) {
            onPieClick(null as any, index);
        }
    };

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
                    <div className="glass p-12 rounded-[3.5rem] border-slate-200 bg-white/60 min-h-[750px] flex flex-col relative transition-all duration-500 overflow-hidden">
                        <div className="mb-12">
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 flex items-center gap-2">
                                <Target className="w-4 h-4 text-indigo-500" />
                                {viewMode === 'category' ? 'Market Overview' : `${activeCategory} Breakdown`}
                            </h2>
                            <p className="text-slate-900 font-black text-xl">Interactive Pie Distribution</p>
                        </div>

                        <div className="h-[430px] w-full shrink-0">
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
                                        iconType="circle"
                                        onClick={handleLegendClick}
                                        wrapperStyle={{
                                            paddingTop: '40px',
                                            position: 'relative',
                                            overflowY: 'auto',
                                            maxHeight: '180px',
                                            width: '100%',
                                            scrollbarWidth: 'none',
                                            cursor: 'pointer'
                                        }}
                                        formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-colors">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {viewMode === 'industry' && (
                                <button
                                    onClick={() => { setViewMode('category'); setActiveCategory(null); setSelectedLabel(null); setIndustryCompanies([]); }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full flex flex-col items-center justify-center group z-10"
                                >
                                    <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:-translate-x-1" />
                                    <span className="text-[8px] font-black text-slate-300 group-hover:text-indigo-600 uppercase tracking-[0.2em] mt-1">Exit</span>
                                </button>
                            )}
                        </div>
                        <div className="text-center mt-auto pt-10">
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

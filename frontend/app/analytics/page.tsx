'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalyticsData {
    year: string;
    verticals: Record<string, number>;
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('http://localhost:8000/analytics');
                const analytics = await res.json();
                setData(analytics);
            } catch (error) {
                console.error("Analytics fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black">
            <div className="w-16 h-16 border-t-2 border-purple-500 rounded-full animate-spin mb-8 shadow-[0_0_20px_rgba(139,92,246,0.2)]"></div>
            <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs">Processing Intelligence Distribution...</p>
        </div>
    );

    return (
        <main className="min-h-screen bg-black pb-20 selection:bg-purple-500/30">
            <div className="py-24 relative overflow-hidden">
                <div className="absolute top-0 right-1/2 translate-x-1/2 w-[1000px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="mb-12">
                        <Link href="/" className="text-gray-400 hover:text-purple-400 font-black uppercase tracking-[0.3em] text-[10px] transition-all flex items-center gap-3">
                            <span className="p-2 rounded-lg bg-white/5">←</span>
                            Exit to Intelligence Pool
                        </Link>
                    </nav>
                    <div className="flex flex-col space-y-4">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass border-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">
                            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(139,92,246,0.8)]"></span>
                            <span>Ecosystem Forensics</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
                            Ecosystem <span className="text-gradient">Analytics.</span>
                        </h1>
                        <p className="max-w-xl text-gray-500 mt-4 text-xl font-medium uppercase tracking-tighter leading-tight">
                            Vertical intelligence distribution across spectral cohorts (2024-2026).
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12">
                    {data.map((yearData) => (
                        <div key={yearData.year} className="glass p-12 rounded-[3.5rem] border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Temporal Cohort</span>
                                    <h2 className="text-5xl font-black text-white tracking-tighter">CYCLE {yearData.year}</h2>
                                </div>
                                <div className="glass px-8 py-6 rounded-3xl border-purple-500/20 text-center">
                                    <span className="block text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Total Intelligence Units</span>
                                    <span className="text-4xl font-black text-white">
                                        {Object.values(yearData.verticals).reduce((a, b) => a + b, 0)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                                {Object.entries(yearData.verticals)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([vertical, count]) => {
                                        const total = Object.values(yearData.verticals).reduce((a, b) => a + b, 0);
                                        const percentage = (count / total) * 100;

                                        return (
                                            <div key={vertical} className="group/item">
                                                <div className="flex justify-between items-end mb-4 px-2">
                                                    <div className="space-y-1">
                                                        <span className="block text-[10px] font-black text-white/30 uppercase tracking-[0.3em] group-hover/item:text-purple-400 transition-colors">{vertical}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-xl font-black text-white">{count}</span>
                                                        <span className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">{percentage.toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/5 p-[2px]">
                                                    <div
                                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out group-hover/item:shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}

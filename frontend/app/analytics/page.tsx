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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mb-6"></div>
            <p className="text-gray-500 font-bold text-xl">Processing Intelligence Distribution...</p>
        </div>
    );

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200 py-12 mb-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="mb-8">
                        <Link href="/" className="text-gray-400 hover:text-purple-600 font-black uppercase tracking-widest text-xs transition-colors">
                            &larr; Back to Intelligence Pool
                        </Link>
                    </nav>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight">
                        📈 Startup Ecosystem <span className="text-purple-600">Analytics</span>
                    </h1>
                    <p className="text-gray-500 mt-4 text-xl">Vertical distribution across years (2024-2026).</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10">
                    {data.map((yearData) => (
                        <div key={yearData.year} className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Cohort: {yearData.year}</h2>
                                <span className="bg-purple-50 text-purple-600 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest border border-purple-100">
                                    {Object.values(yearData.verticals).reduce((a, b) => a + b, 0)} Total Startups
                                </span>
                            </div>

                            <div className="space-y-6">
                                {Object.entries(yearData.verticals)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([vertical, count]) => {
                                        const total = Object.values(yearData.verticals).reduce((a, b) => a + b, 0);
                                        const percentage = (count / total) * 100;

                                        return (
                                            <div key={vertical} className="group">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-black text-gray-700 uppercase tracking-widest">{vertical}</span>
                                                    <span className="text-sm font-black text-gray-400">{count} Startups ({percentage.toFixed(1)}%)</span>
                                                </div>
                                                <div className="w-full bg-gray-50 rounded-full h-4 overflow-hidden border border-gray-100">
                                                    <div
                                                        className="bg-purple-600 h-full transition-all duration-1000 ease-out group-hover:bg-purple-500"
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Zap, ArrowLeft, CheckCircle, XCircle, Loader2, Terminal } from 'lucide-react';
import { useRef } from 'react';
import { useEffect as useReactEffect } from 'react';

export default function AdminPage() {
    const [adminKey, setAdminKey] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [scrapeStatus, setScrapeStatus] = useState({ is_running: false, progress: 0, current_step: "", last_run: null as string | null });
    const [logs, setLogs] = useState<string[]>([]);
    const [message, setMessage] = useState<string | null>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchScrapeLogs = async () => {
        try {
            const res = await fetch(`${apiUrl}/scrape/logs`);
            const data = await res.json();
            setLogs(data.logs || []);
        } catch {
            // silent fail
        }
    };

    const fetchScrapeStatus = async () => {
        try {
            const res = await fetch(`${apiUrl}/scrape/status`);
            const data = await res.json();
            setScrapeStatus(data);
            if (data.is_running) {
                fetchScrapeLogs();
                setTimeout(fetchScrapeStatus, 2000);
            }
        } catch {
            // silently fail
        }
    };

    useEffect(() => {
        // Check for key in URL params
        const params = new URLSearchParams(window.location.search);
        const keyParam = params.get('key');
        if (keyParam) {
            setAdminKey(keyParam);
            setAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (authenticated) {
            fetchScrapeStatus();
            fetchScrapeLogs(); // Initial log fetch
        }
    }, [authenticated]);

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminKey.trim()) {
            setAuthenticated(true);
            setError(null);
        }
    };

    const handleScrape = async () => {
        setMessage(null);
        setError(null);
        try {
            const res = await fetch(`${apiUrl}/scrape?admin_key=${encodeURIComponent(adminKey)}`, { method: 'POST' });
            if (res.status === 403) {
                setError('Invalid admin key. Access denied.');
                setAuthenticated(false);
                return;
            }
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const data = await res.json();
            setMessage(data.message);
            fetchScrapeStatus();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Connection failed');
        }
    };

    // Login screen
    if (!authenticated) {
        return (
            <main className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
                <div className="w-full max-w-md p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6">
                            <Shield className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Admin Console</h1>
                        <p className="text-slate-500 text-sm mt-2">Enter your admin key to access scrape controls</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            placeholder="Admin Key"
                            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm uppercase tracking-widest rounded-2xl transition-all hover:shadow-lg hover:shadow-indigo-500/20"
                        >
                            Authenticate
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/20">
                            <XCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link href="/" className="text-slate-600 text-xs hover:text-slate-400 transition-colors">
                            ← Back to Intelligence Pool
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // Admin dashboard
    return (
        <main className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <div className="max-w-3xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tight">Admin Console</h1>
                            <p className="text-slate-500 text-xs font-mono mt-0.5">Scrape & Data Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"></span>
                        <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Authenticated</span>
                    </div>
                </div>

                {/* Scrape Control */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-white font-bold text-lg">Intel Harvest</h2>
                            <p className="text-slate-500 text-sm mt-1">Trigger a full scrape of all data sources</p>
                        </div>
                        <button
                            onClick={handleScrape}
                            disabled={scrapeStatus.is_running}
                            className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${scrapeStatus.is_running
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20'
                                }`}
                        >
                            <Zap className={`w-4 h-4 ${scrapeStatus.is_running ? 'animate-pulse' : ''}`} />
                            {scrapeStatus.is_running ? 'Running...' : 'Start Harvest'}
                        </button>
                    </div>

                    {/* Progress */}
                    {scrapeStatus.is_running && (
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    {scrapeStatus.current_step}
                                </span>
                                <span className="text-white font-bold">{scrapeStatus.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-indigo-500 h-full rounded-full transition-all duration-700"
                                    style={{ width: `${scrapeStatus.progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {scrapeStatus.last_run && !scrapeStatus.is_running && (
                        <div className="mt-4 text-slate-500 text-xs font-mono">
                            Last run: {new Date(scrapeStatus.last_run).toLocaleString()}
                        </div>
                    )}
                </div>

                {/* Live Logs - Streaming Event Logs */}
                <div className="bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden mb-6 shadow-2xl">
                    <div className="px-6 py-4 bg-slate-800/50 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-white font-bold text-xs uppercase tracking-[0.2em]">Live Intelligence Stream</h3>
                        </div>
                        <div className="flex gap-1.5 font-mono text-[10px]">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/50"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30 border border-amber-500/50"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30 border border-emerald-500/50"></span>
                        </div>
                    </div>
                    <div
                        ref={logContainerRef}
                        className="p-6 h-[300px] overflow-y-auto font-mono text-[13px] leading-relaxed scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                    >
                        {logs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3">
                                <div className="w-8 h-8 border border-white/10 rounded-lg flex items-center justify-center grayscale opacity-50">📡</div>
                                <span className="text-[10px] uppercase tracking-widest font-black">Waiting for signal...</span>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {logs.map((log, idx) => {
                                    const isPhase = log.includes('Phase') || log.includes('Initializing') || log.includes('complete');
                                    const isError = log.includes('ERROR') || log.includes('❌');
                                    return (
                                        <div key={idx} className={`${isPhase ? 'text-indigo-400 font-bold mt-4 mb-2' : isError ? 'text-red-400 bg-red-400/5 px-2 py-1 rounded' : 'text-slate-400'}`}>
                                            {log}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Messages */}
                {message && (
                    <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 px-5 py-4 rounded-2xl border border-emerald-500/20 mb-6">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        {message}
                    </div>
                )}
                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-5 py-4 rounded-2xl border border-red-500/20 mb-6">
                        <XCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* API Info */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                    <h2 className="text-white font-bold text-lg mb-4">Connection</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-slate-500 text-sm">API Endpoint</span>
                            <span className="text-slate-300 text-sm font-mono">{apiUrl}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                            <span className="text-slate-500 text-sm">Scrape Status</span>
                            <span className={`text-sm font-mono ${scrapeStatus.is_running ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {scrapeStatus.is_running ? 'RUNNING' : 'IDLE'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-slate-500 text-sm">Current Step</span>
                            <span className="text-slate-300 text-sm font-mono">{scrapeStatus.current_step || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

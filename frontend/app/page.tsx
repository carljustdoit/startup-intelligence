'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CompanyCard from '../components/CompanyCard';
import { Search, SlidersHorizontal, LayoutGrid, List, Zap, BarChart3 } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  logo_url: string | null;
  one_liner: string | null;
  batch: string | null;
  website: string | null;
  source: string;
  industry: string | null;
  funding_raised: string | null;
  team_size: number | null;
  problem: string | null;
  founders: {
    id: number;
    name: string;
    role: string | null;
    linkedin_url: string | null;
  }[];
}

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('id');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [scrapeStatus, setScrapeStatus] = useState({ is_running: false, progress: 0, current_step: "", last_run: null });
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '12',
        sort_by: sortBy,
        order: order,
      });
      if (search) params.append('search', search);
      if (source !== 'All') params.append('source', source);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/companies?${params.toString()}`);
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      setCompanies(data.items);
      setTotalPages(data.pages);
      setError(null);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Unable to synchronize with intelligence stream. Verify backend connectivity and CORS settings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchScrapeStatus = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/scrape/status`);
      const data = await res.json();
      setScrapeStatus(data);
      if (data.is_running) {
        setTimeout(fetchScrapeStatus, 2000);
      }
    } catch (error) {
      console.error("Status check error:", error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [search, source, sortBy, order, page]);

  useEffect(() => {
    fetchScrapeStatus();
  }, []);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setOrder('desc');
    }
  };

  const handleRefresh = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/scrape`, { method: 'POST' });
      if (!res.ok) throw new Error(`Pulse Sync Failed: ${res.status}`);
      fetchScrapeStatus();
      setError(null);
    } catch (error) {
      console.error("Refresh error:", error);
      setError("Intelligence Harvest Link Severed. Verify backend status and CORS configuration.");
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <span className="ml-1 opacity-20">↕</span>;
    return <span className="ml-1 text-indigo-600">{order === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <main className="min-h-screen pb-20 selection:bg-indigo-100">
      {/* Header Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full glass border-slate-200 text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
              <span>Proprietary Intel Stream</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900">
              Intelligence <span className="text-indigo-600">Pool.</span>
            </h1>

            <p className="max-w-2xl text-xl text-slate-500 font-medium leading-relaxed">
              Tracking high-velocity signals across global venture ecosystems.
              Synthesized forensics for professional capital allocators.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Link
                href="/analytics"
                className="px-8 py-4 glass glass-hover rounded-2.5xl text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 border-slate-200"
              >
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                Ecosystem Metrics
              </Link>
              <button
                onClick={handleRefresh}
                disabled={scrapeStatus.is_running}
                className={`px-8 py-4 rounded-2.5xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all border shadow-sm ${scrapeStatus.is_running
                  ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
                  : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700 hover:shadow-indigo-200 hover:translate-y-[-2px]'
                  }`}
              >
                <Zap className={`w-4 h-4 ${scrapeStatus.is_running ? 'animate-pulse' : ''}`} />
                {scrapeStatus.is_running ? 'Syncing Intelligence...' : 'Initiate Intel Harvest'}
              </button>
            </div>
          </div>

          {/* Scrape Progress */}
          {scrapeStatus.is_running && (
            <div className="mt-16 max-w-2xl mx-auto px-4">
              <div className="glass p-10 rounded-[2.5rem] border-indigo-100 shadow-xl bg-white/60">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Stream Status</span>
                    <span className="text-slate-900 font-bold">{scrapeStatus.current_step}</span>
                  </div>
                  <span className="text-3xl font-black text-slate-900">{scrapeStatus.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200 p-[2px]">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                    style={{ width: `${scrapeStatus.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mt-20 flex flex-col md:flex-row gap-4 p-3 bg-white/60 rounded-[3rem] border border-slate-200 backdrop-blur-2xl shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300" />
              <input
                type="text"
                placeholder="Analyze companies, problems, founders, or sectors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-transparent border-none focus:ring-0 outline-none text-slate-900 font-medium placeholder:text-slate-300 text-lg"
              />
            </div>
            <div className="flex gap-4 p-1">
              <div className="relative">
                <SlidersHorizontal className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="pl-14 pr-10 py-4 bg-white rounded-2xl outline-none border border-slate-200 font-black text-[10px] uppercase tracking-widest text-slate-700 cursor-pointer hover:border-indigo-400 transition-all appearance-none shadow-sm"
                >
                  <option value="All">Global Source</option>
                  <option value="YC">Y Combinator</option>
                  <option value="StartX">StartX</option>
                  <option value="AV">Alumni Ventures</option>
                </select>
              </div>

              <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'cards' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-12 p-8 glass border-red-200 bg-red-50/50 rounded-[2.5rem] flex items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-red-900 uppercase tracking-tight">Connectivity Interrupted</h3>
              <p className="text-red-600/80 font-medium text-sm mt-1">{error}</p>
            </div>
          </div>
        )}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-12 h-12 border-t-2 border-r-2 border-indigo-600 rounded-full animate-spin mb-8"></div>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing Local Intelligence Database...</p>
          </div>
        ) : (
          <>
            {companies.length === 0 ? (
              <div className="text-center py-32 glass rounded-[3rem] border-dashed border-slate-200 bg-white/40">
                <div className="text-5xl mb-8 grayscale opacity-50">📡</div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">Null Sector Signal</h3>
                <p className="text-slate-400 font-medium">Reset your parameters to restore environmental telemetry.</p>
              </div>
            ) : (
              <>
                {viewMode === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {companies.map((company) => (
                      <Link key={company.id} href={`/companies/${company.id}`} className="block h-full group">
                        <CompanyCard company={company} />
                      </Link>
                    ))}
                  </div>
                )}

                {viewMode === 'table' && (
                  <div className="glass rounded-[2.5rem] overflow-hidden border-slate-200 shadow-sm bg-white/40">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/50">
                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identity</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] cursor-pointer group" onClick={() => handleSort('name')}>
                              Startup <SortIcon column="name" />
                            </th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] cursor-pointer group" onClick={() => handleSort('batch')}>
                              Cohort <SortIcon column="batch" />
                            </th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sector</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Network Hub</th>
                            <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Origin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {companies.map((company) => (
                            <tr
                              key={company.id}
                              className="hover:bg-white/60 transition-colors group cursor-pointer"
                              onClick={() => window.location.href = `/companies/${company.id}`}
                            >
                              <td className="px-10 py-8">
                                {company.logo_url ? (
                                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 p-2 shadow-sm">
                                    <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 font-black text-lg border border-slate-100 border-dashed">
                                    {company.name[0]}
                                  </div>
                                )}
                              </td>
                              <td className="px-10 py-8">
                                <div className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-lg tracking-tight">{company.name}</div>
                                <div className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest truncate max-w-xs">{company.one_liner}</div>
                              </td>
                              <td className="py-6 px-4">
                                {company.batch && (
                                  <div className="flex flex-wrap gap-1">
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-tighter whitespace-nowrap">
                                      {company.batch}
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="px-10 py-8">
                                <div className="text-sm text-slate-500 font-bold uppercase tracking-tight">{company.industry || "General"}</div>
                              </td>
                              <td className="px-10 py-8">
                                {company.website && (
                                  <a
                                    href={company.website}
                                    target="_blank"
                                    className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-600 hover:text-indigo-800 transition-colors underline decoration-indigo-200 underline-offset-4"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Visit Web
                                  </a>
                                )}
                              </td>
                              <td className="px-10 py-8">
                                <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${company.source === 'YC' ? 'text-orange-500' :
                                  company.source === 'StartX' ? 'text-cyan-500' :
                                    'text-purple-500'
                                  }`}>{company.source}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-20 flex justify-center items-center gap-10">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="w-14 h-14 flex items-center justify-center glass rounded-2.5xl disabled:opacity-20 hover:border-indigo-400 hover:text-indigo-600 transition-all text-xl shadow-sm"
                    >
                      ←
                    </button>
                    <div className="text-slate-400 font-black tracking-[0.5em] uppercase text-[10px]">
                      Phase <span className="text-slate-900 text-xl mx-2">{page}</span> / {totalPages}
                    </div>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="w-14 h-14 flex items-center justify-center glass rounded-2.5xl disabled:opacity-20 hover:border-indigo-400 hover:text-indigo-600 transition-all text-xl shadow-sm"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 border-t border-slate-100 pt-8">
        <div className="flex justify-between items-center opacity-30 hover:opacity-100 transition-opacity">
          <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
            Node: {process.env.NODE_ENV} | API: {process.env.NEXT_PUBLIC_API_URL || 'local-host'}
          </div>
          <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">
            Startup Intelligence v4.2.1-PROD
          </div>
        </div>
      </div>
    </main>
  );
}

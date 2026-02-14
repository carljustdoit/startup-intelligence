'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CompanyCard from '../components/CompanyCard';

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

      const res = await fetch(`http://localhost:8000/companies?${params.toString()}`);
      const data = await res.json();
      setCompanies(data.items);
      setTotalPages(data.pages);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScrapeStatus = async () => {
    try {
      const res = await fetch('http://localhost:8000/scrape/status');
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
      await fetch('http://localhost:8000/scrape', { method: 'POST' });
      fetchScrapeStatus();
    } catch (error) {
      console.error("Refresh error:", error);
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return <span className="ml-1 opacity-20">↕</span>;
    return <span className="ml-1 text-cyan-400">{order === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <main className="min-h-screen pb-20 selection:bg-cyan-500/30">
      {/* Header Section */}
      <div className="py-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass border-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>
              <span>Next-Gen Intelligence Sync</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white">
              Intelligence <span className="text-gradient">Pool.</span>
            </h1>

            <p className="max-w-2xl text-xl text-gray-400 font-medium leading-relaxed">
              Synthesizing real-time data flow from the world's most aggressive capital silos.
              Premium VC forensics for the next generation.
            </p>

            <div className="flex flex-wrap justify-center gap-6 pt-8">
              <Link
                href="/analytics"
                className="px-8 py-4 glass glass-hover rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3"
              >
                <span className="p-2 rounded-lg bg-purple-500/20 text-purple-400">📊</span>
                Ecosystem Metrics
              </Link>
              <button
                onClick={handleRefresh}
                disabled={scrapeStatus.is_running}
                className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${scrapeStatus.is_running
                    ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]'
                  }`}
              >
                <span className={`p-2 rounded-lg ${scrapeStatus.is_running ? 'bg-gray-800' : 'bg-black/5'} ${scrapeStatus.is_running ? 'animate-spin' : ''}`}>⚡</span>
                {scrapeStatus.is_running ? 'Syncing...' : 'Force Intelligence Sync'}
              </button>
            </div>
          </div>

          {/* Scrape Progress */}
          {scrapeStatus.is_running && (
            <div className="mt-16 max-w-3xl mx-auto">
              <div className="glass p-8 rounded-[2rem] border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Neural Status</span>
                    <span className="text-white font-bold">{scrapeStatus.current_step}</span>
                  </div>
                  <span className="text-3xl font-black text-white">{scrapeStatus.progress}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-indigo-600 h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                    style={{ width: `${scrapeStatus.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mt-20 flex flex-col md:flex-row gap-6 p-2 bg-white/5 rounded-[3rem] border border-white/5 backdrop-blur-xl">
            <div className="relative flex-1">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl opacity-50">🔍</span>
              <input
                type="text"
                placeholder="Query companies, problems, founders, or verticals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-16 pr-8 py-6 bg-transparent border-none focus:ring-0 outline-none text-white font-medium placeholder:text-gray-600 text-lg"
              />
            </div>
            <div className="flex gap-4 p-2">
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="px-8 py-4 bg-white/5 rounded-2xl outline-none border border-white/10 font-black text-[10px] uppercase tracking-widest text-white cursor-pointer hover:bg-white/10 transition-all appearance-none"
              >
                <option value="All">All Sources</option>
                <option value="YC">Y Combinator</option>
                <option value="StartX">StartX</option>
                <option value="AV">Alumni Ventures</option>
              </select>

              <div className="h-full w-[1px] bg-white/10 mx-2"></div>

              <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${viewMode === 'table' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${viewMode === 'cards' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-16 h-16 border-t-2 border-r-2 border-cyan-400 rounded-full animate-spin mb-8 shadow-[0_0_20px_rgba(34,211,238,0.2)]"></div>
            <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs">Deciphering Intelligence Stream...</p>
          </div>
        ) : (
          <>
            {companies.length === 0 ? (
              <div className="text-center py-32 glass rounded-[3rem] border-dashed">
                <div className="text-6xl mb-8 opacity-20">📡</div>
                <h3 className="text-2xl font-black text-white mb-2">Zero Signals Found</h3>
                <p className="text-gray-500 font-medium">No results match your current spectral parameters.</p>
              </div>
            ) : (
              <>
                {viewMode === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {companies.map((company) => (
                      <Link key={company.id} href={`/companies/${company.id}`} className="block h-full cursor-none-custom">
                        <CompanyCard company={company} />
                      </Link>
                    ))}
                  </div>
                )}

                {viewMode === 'table' && (
                  <div className="glass rounded-[2.5rem] overflow-x-auto border border-white/5">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Platform</th>
                          <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] cursor-pointer group" onClick={() => handleSort('name')}>
                            Startup <SortIcon column="name" />
                          </th>
                          <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] cursor-pointer group" onClick={() => handleSort('batch')}>
                            Batch <SortIcon column="batch" />
                          </th>
                          <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Industry</th>
                          <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Digital Hub</th>
                          <th className="px-10 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Source</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {companies.map((company) => (
                          <tr
                            key={company.id}
                            className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                            onClick={() => window.location.href = `/companies/${company.id}`}
                          >
                            <td className="px-10 py-8">
                              {company.logo_url ? (
                                <img src={company.logo_url} alt={company.name} className="w-10 h-10 rounded-lg object-contain bg-white/5 border border-white/10" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/20 font-black text-lg border border-white/10 border-dashed">
                                  {company.name[0]}
                                </div>
                              )}
                            </td>
                            <td className="px-10 py-8">
                              <div className="font-black text-white group-hover:text-cyan-400 transition-colors text-lg tracking-tight">{company.name}</div>
                              <div className="text-[10px] text-gray-600 font-bold mt-1 uppercase tracking-widest truncate max-w-xs">{company.one_liner}</div>
                            </td>
                            <td className="px-10 py-8">
                              <span className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-widest border border-white/5">
                                {company.batch}
                              </span>
                            </td>
                            <td className="px-10 py-8">
                              <div className="text-sm text-gray-500 font-bold uppercase tracking-tighter">{company.industry || "General"}</div>
                            </td>
                            <td className="px-10 py-8">
                              {company.website && (
                                <a
                                  href={company.website}
                                  target="_blank"
                                  className="text-[10px] font-black text-cyan-500 hover:text-cyan-400 transition-colors underline decoration-cyan-500/30 underline-offset-4"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Visit Domain
                                </a>
                              )}
                            </td>
                            <td className="px-10 py-8">
                              <div className="text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em]">{company.source}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-20 flex justify-center items-center gap-8">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="w-14 h-14 flex items-center justify-center glass rounded-2xl disabled:opacity-20 hover:border-cyan-500/50 transition-all text-xl"
                    >
                      ←
                    </button>
                    <div className="text-gray-500 font-black tracking-[0.4em] uppercase text-[10px]">
                      Sector <span className="text-white text-lg mx-2">{page}</span> / {totalPages}
                    </div>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="w-14 h-14 flex items-center justify-center glass rounded-2xl disabled:opacity-20 hover:border-cyan-500/50 transition-all text-xl"
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
    </main>
  );
}

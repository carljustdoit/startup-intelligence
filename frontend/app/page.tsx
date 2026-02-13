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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [scrapeStatus, setScrapeStatus] = useState({ is_running: false, progress: 0, current_step: "", last_run: null });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20',
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
    if (sortBy !== column) return <span className="ml-1 opacity-20 group-hover:opacity-50">↕</span>;
    return <span className="ml-1 text-indigo-600">{order === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 py-10 mb-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center">
                🚀 Intelligence Pool <span className="ml-3 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full font-bold uppercase tracking-widest">Phase 4</span>
              </h1>
              <p className="text-gray-500 mt-2 text-lg">Logo Integration & Live Scraping Metrics.</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'table' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'cards' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Grid
                </button>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/analytics"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all shadow-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Analytics
                </Link>
                <button
                  onClick={handleRefresh}
                  disabled={scrapeStatus.is_running}
                  className={`px-6 py-2 ${scrapeStatus.is_running ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg transition-all shadow-lg flex items-center gap-2`}
                >
                  <svg className={`w-4 h-4 ${scrapeStatus.is_running ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  {scrapeStatus.is_running ? 'Refreshing...' : 'Refresh Intelligence'}
                </button>
              </div>
            </div>
          </div>

          {/* Scrape Progress Bar */}
          {scrapeStatus.is_running && (
            <div className="mt-8">
              <div className="bg-white border-2 border-indigo-100 p-6 rounded-3xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-900 font-black flex items-center gap-2 uppercase tracking-widest text-xs">
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping"></span>
                    Current Activity: {scrapeStatus.current_step}
                  </span>
                  <span className="text-indigo-600 font-black">{scrapeStatus.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden border border-gray-200">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-700 ease-out"
                    style={{ width: `${scrapeStatus.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mt-10 flex flex-col md:flex-row gap-5">
            <div className="relative flex-1">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl">🔍</span>
              <input
                type="text"
                placeholder="Search names, problems, founders, or industries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4.5 border-2 border-gray-100 rounded-3xl focus:border-indigo-400 outline-none transition-all hover:bg-gray-50 text-gray-800 shadow-sm"
              />
            </div>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="px-8 py-4.5 border-2 border-gray-100 rounded-3xl outline-none appearance-none bg-white font-bold text-gray-700 cursor-pointer hover:bg-gray-50 transition-all shadow-sm"
            >
              <option value="All">All VCs</option>
              <option value="YC">Y Combinator</option>
              <option value="StartX">StartX</option>
              <option value="AV">Alumni Ventures</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mb-6"></div>
            <p className="text-gray-500 font-bold text-xl">Aggregating Global Intelligence...</p>
          </div>
        ) : (
          <>
            {companies.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="text-6xl mb-6">🏜️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Intelligence Found</h3>
                <p className="text-gray-500">Try refining your filters or trigger a new scrape.</p>
              </div>
            ) : (
              <>
                {viewMode === 'cards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {companies.map((company) => (
                      <Link key={company.id} href={`/companies/${company.id}`} className="block h-full transition-transform hover:-translate-y-2">
                        <CompanyCard company={company} />
                      </Link>
                    ))}
                  </div>
                )}

                {viewMode === 'table' && (
                  <div className="bg-white rounded-3xl shadow-2xl overflow-x-auto border border-gray-100">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                          <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer group">
                            Logo
                          </th>
                          <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer group" onClick={() => handleSort('name')}>
                            Startup <SortIcon column="name" />
                          </th>
                          <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer group" onClick={() => handleSort('batch')}>
                            Batch <SortIcon column="batch" />
                          </th>
                          <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer group" onClick={() => handleSort('industry')}>
                            Industry <SortIcon column="industry" />
                          </th>
                          <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer group" onClick={() => handleSort('funding_raised')}>
                            Funding <SortIcon column="funding_raised" />
                          </th>
                          <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest cursor-pointer group" onClick={() => handleSort('source')}>
                            Source <SortIcon column="source" />
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {companies.map((company) => (
                          <tr
                            key={company.id}
                            className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                            onClick={() => window.location.href = `/companies/${company.id}`}
                          >
                            <td className="px-8 py-6">
                              {company.logo_url ? (
                                <img src={company.logo_url} alt={company.name} className="w-12 h-12 rounded-xl object-contain bg-white border border-gray-100 shadow-sm" />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-xl border-2 border-dashed border-gray-200">
                                  {company.name[0]}
                                </div>
                              )}
                            </td>
                            <td className="px-8 py-6">
                              <div className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors text-lg">{company.name}</div>
                              <div className="text-xs text-gray-400 font-bold mt-1 tracking-wider uppercase h-4 overflow-hidden line-clamp-1">{company.one_liner}</div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-tighter">
                                {company.batch}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="text-sm text-gray-600 font-medium">{company.industry || "General"}</div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="px-3 py-1 bg-green-50 text-green-700 rounded-lg inline-block font-black text-xs">
                                {company.funding_raised || "Undisclosed"}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="text-xs font-black text-indigo-400 uppercase tracking-widest">{company.source}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-16 flex justify-center items-center gap-6">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-2xl disabled:opacity-30 hover:bg-white hover:border-indigo-400 transition-all text-xl"
                    >
                      ←
                    </button>
                    <div className="text-gray-500 font-black tracking-widest uppercase text-xs">
                      Page <span className="text-indigo-600 text-lg mx-2">{page}</span> of {totalPages}
                    </div>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="w-12 h-12 flex items-center justify-center border-2 border-gray-200 rounded-2xl disabled:opacity-30 hover:bg-white hover:border-indigo-400 transition-all text-xl"
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

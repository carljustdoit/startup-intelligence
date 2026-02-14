import React from 'react';
import { ExternalLink, Globe } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  logo_url: string | null;
  one_liner: string | null;
  batch: string | null;
  website: string | null;
  source: string;
  funding_raised: string | null;
  founders: {
    id: number;
    name: string;
    role: string | null;
    linkedin_url: string | null;
  }[];
}

interface CompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  return (
    <div className="glass glass-hover p-8 rounded-[2.5rem] flex flex-col justify-between h-full group relative overflow-hidden bg-white/40 border-slate-200">
      {/* Subtle accent gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="relative">
            {company.logo_url ? (
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-2 shadow-sm group-hover:shadow-md transition-shadow">
                <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 font-black text-2xl border border-slate-200 border-dashed">
                {company.name[0]}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
          </div>

          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] border shadow-sm ${company.source === 'YC' ? 'bg-orange-50 text-orange-600 border-orange-200' :
              company.source === 'StartX' ? 'bg-cyan-50 text-cyan-600 border-cyan-200' :
                'bg-purple-50 text-purple-600 border-purple-200'
            }`}>
            {company.source}
          </span>
        </div>

        <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors tracking-tight leading-tight">
          {company.name}
        </h3>

        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest mb-4 flex items-center gap-1.5 group/link"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="w-3 h-3" />
            <span className="truncate">{company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
          </a>
        )}

        <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
          {company.one_liner || "Strategic intelligence synthesis in progress."}
        </p>
      </div>

      <div>
        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest mb-8">
          {company.batch && (
            <span className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600">
              {company.batch}
            </span>
          )}
          {company.funding_raised && (
            <span className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-emerald-700">
              {company.funding_raised}
            </span>
          )}
        </div>

        {company.founders.length > 0 && (
          <div className="mb-8 pt-6 border-t border-slate-100">
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Leadership</h4>
            <div className="flex -space-x-2">
              {company.founders.slice(0, 3).map((founder, i) => (
                <div
                  key={founder.id}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-600 group-hover:scale-110 transition-transform cursor-help shadow-sm"
                  title={founder.name}
                  style={{ zIndex: 3 - i }}
                >
                  {founder.name[0]}
                </div>
              ))}
              {company.founders.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm">
                  +{company.founders.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent"></div>
          <span className="ml-4 text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] group-hover:translate-x-1 transition-all">
            Initialize Access &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;

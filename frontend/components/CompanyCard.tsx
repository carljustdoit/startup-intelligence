import React from 'react';

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
    <div className="glass glass-hover p-8 rounded-[2.5rem] flex flex-col justify-between h-full group relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="relative">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="w-16 h-16 rounded-2xl object-contain bg-white/5 border border-white/10 p-2" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 font-black text-2xl border border-white/10 border-dashed">
                {company.name[0]}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0a0a0b] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          </div>

          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.2em] border shadow-lg ${company.source === 'YC' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
              company.source === 'StartX' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                'bg-purple-500/10 text-purple-400 border-purple-500/20'
            }`}>
            {company.source}
          </span>
        </div>

        <h3 className="text-2xl font-black text-white mb-2 group-hover:text-cyan-400 transition-colors tracking-tight leading-tight">
          {company.name}
        </h3>

        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-gray-500 hover:text-cyan-400 transition-colors uppercase tracking-widest mb-4 block truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        )}

        <p className="text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
          {company.one_liner || "Strategic intelligence synthesis in progress."}
        </p>
      </div>

      <div>
        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest mb-8">
          {company.batch && (
            <span className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-gray-300">
              {company.batch}
            </span>
          )}
          {company.funding_raised && (
            <span className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              {company.funding_raised}
            </span>
          )}
        </div>

        {company.founders.length > 0 && (
          <div className="mb-8 pt-6 border-t border-white/5">
            <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Founders</h4>
            <div className="flex -space-x-2">
              {company.founders.slice(0, 3).map((founder, i) => (
                <div
                  key={founder.id}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-[#0a0a0b] flex items-center justify-center text-[10px] font-black text-white group-hover:scale-110 transition-transform cursor-help"
                  title={founder.name}
                  style={{ zIndex: 3 - i }}
                >
                  {founder.name[0]}
                </div>
              ))}
              {company.founders.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-[#0a0a0b] flex items-center justify-center text-[10px] font-black text-gray-400">
                  +{company.founders.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          <span className="ml-4 text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] group-hover:tracking-[0.4em] transition-all">
            Initialize Access &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompanyCard;

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
    <div className="border border-gray-200 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all bg-white flex flex-col justify-between h-full group">
      <div>
        <div className="flex justify-between items-start mb-4">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="w-16 h-16 rounded-2xl object-contain bg-white border border-gray-100 shadow-sm" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-2xl border-2 border-dashed border-gray-200">
              {company.name[0]}
            </div>
          )}
          <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${company.source === 'YC' ? 'bg-orange-100 text-orange-800' :
              company.source === 'StartX' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
            }`}>
            {company.source}
          </span>
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors tracking-tight">{company.name}</h3>
        <p className="text-gray-500 text-sm font-medium line-clamp-2 italic mb-6">
          "{company.one_liner || "No intelligence report available yet."}"
        </p>
      </div>

      <div>
        <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-tighter mb-6">
          {company.batch && (
            <span className="flex items-center bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600">
              🗓 {company.batch}
            </span>
          )}
          {company.funding_raised && (
            <span className="flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-lg">
              💰 {company.funding_raised}
            </span>
          )}
        </div>

        {company.founders.length > 0 && (
          <div className="mb-6 pt-6 border-t border-gray-50">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Founders</h4>
            <div className="flex flex-wrap gap-2">
              {company.founders.slice(0, 3).map((founder) => (
                <span key={founder.id} className="text-xs font-bold text-gray-800 bg-blue-50/50 px-2 py-1 rounded">
                  {founder.name}
                </span>
              ))}
              {company.founders.length > 3 && (
                <span className="text-[10px] font-black text-gray-400 self-center">+{company.founders.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {company.website && (
          <div className="flex justify-end">
            <span className="text-indigo-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
              View Intelligence &rarr;
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;

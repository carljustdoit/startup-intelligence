import React from 'react';
import { Sparkles } from 'lucide-react';

interface SynthesisStatusProps {
    className?: string;
    label?: string;
}

const SynthesisStatus: React.FC<SynthesisStatusProps> = ({
    className = "",
    label = "Synthesis In Progress"
}) => {
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-sm animate-pulse ${className}`}>
            <Sparkles className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {label}
            </span>
        </div>
    );
};

export default SynthesisStatus;

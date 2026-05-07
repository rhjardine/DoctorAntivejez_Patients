import React from 'react';
import { Info } from 'lucide-react';

interface WellnessDisclaimerProps {
    text: string;
    className?: string;
}

const WellnessDisclaimer: React.FC<WellnessDisclaimerProps> = ({ text, className = "" }) => {
    return (
        <div className={`flex items-start gap-3 text-[12px] leading-relaxed p-4 rounded-2xl border transition-all bg-vytalix-sage/5 border-vytalix-sage/10 ${className}`}>
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-vytalix-sage" />
            <p className="font-medium text-vytalix-graphite/60 italic">
                {text}
            </p>
        </div>
    );
};

export default WellnessDisclaimer;

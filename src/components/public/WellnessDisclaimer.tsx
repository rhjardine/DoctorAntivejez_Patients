import React from 'react';
import { Info } from 'lucide-react';

interface WellnessDisclaimerProps {
    text: string;
    className?: string;
}

const WellnessDisclaimer: React.FC<WellnessDisclaimerProps> = ({ text, className = "" }) => {
    return (
        <div className={`flex items-start gap-3 text-[12px] leading-relaxed p-4 rounded-2xl border transition-all bg-[#23bcef]/5 border-[#23bcef]/10 ${className}`}>
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#107da8]" />
            <p className="font-medium text-[#293b64]/60 italic">
                {text}
            </p>
        </div>
    );
};

export default WellnessDisclaimer;

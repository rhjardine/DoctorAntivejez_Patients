import React from 'react';
import { Info } from 'lucide-react';
import { WELLNESS } from '../../styles/wellnessPalette';

interface WellnessDisclaimerProps {
    text: string;
    className?: string;
}

const WellnessDisclaimer: React.FC<WellnessDisclaimerProps> = ({ text, className = "" }) => {
    return (
        <div className={`flex items-start gap-2.5 text-[11px] leading-relaxed p-3.5 rounded-xl border transition-colors ${className}`}
            style={{
                background: 'rgba(253, 251, 247, 0.5)',
                borderColor: 'rgba(92, 74, 50, 0.08)',
                color: '#5C4A32' // text-gray-600 equivalent in palette
            }}>
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: WELLNESS.sage }} />
            <p className="font-normal opacity-90 italic">
                {text}
            </p>
        </div>
    );
};

export default WellnessDisclaimer;

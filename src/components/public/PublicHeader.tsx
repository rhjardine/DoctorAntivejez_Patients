import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { WELLNESS } from '../../styles/wellnessPalette';

interface PublicHeaderProps {
    title?: string;
    subtitle?: string;
    onBack?: () => void;
    showBack?: boolean;
    progress?: number; // 0-100
    progressLabel?: string; // e.g., "Grupo 2 de 5"
    theme?: 'clinical' | 'wellness';
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
    title,
    onBack,
    showBack,
    progress,
    progressLabel,
    theme = 'clinical'
}) => {
    const isWellness = theme === 'wellness';
    const bgColor = isWellness ? WELLNESS.earthDark : '#293B64';
    const accentColor = isWellness ? WELLNESS.sage : '#23BCEF';
    const textColor = isWellness ? 'rgba(253, 250, 244, 0.9)' : 'white';

    return (
        <div className="w-full h-[56px] flex flex-col relative shrink-0" style={{ background: bgColor }}>
            <div className="flex items-center h-full px-4">
                {/* Left Section */}
                <div className="w-9">
                    {showBack && onBack && (
                        <button
                            onClick={onBack}
                            className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/15 rounded-full transition-colors"
                            aria-label="Volver"
                        >
                            <ChevronLeft size={20} style={{ color: isWellness ? 'rgba(253, 250, 244, 0.8)' : 'rgba(255,255,255,0.8)' }} />
                        </button>
                    )}
                </div>

                {/* Center Section */}
                <div className="flex-1 flex justify-center text-center overflow-hidden">
                    {title ? (
                        <span className="text-[13px] font-semibold truncate px-2" style={{ color: textColor }}>
                            {title}
                        </span>
                    ) : isWellness ? (
                        <span style={{ color: WELLNESS.bgCard, fontSize: 13, letterSpacing: 3, fontFamily: 'Poppins, sans-serif' }} className="font-black">
                            VYTALIX
                        </span>
                    ) : (
                        <img src="/Logo_azul_oscuro.png" alt="Doctor Antivejez" className="h-7 w-auto" />
                    )}
                </div>

                {/* Right Section (Spacer) */}
                <div className="w-9" />
            </div>

            {/* Progress Bar */}
            {progress !== undefined && (
                <div className="w-full h-[3px] relative overflow-hidden" style={{ background: isWellness ? `${WELLNESS.earth}33` : 'rgba(255,255,255,0.1)' }}>
                    <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%`, background: accentColor }}
                    />
                </div>
            )}

            {/* Progress Label */}
            {progressLabel && progress !== undefined && (
                <div className="absolute top-[59px] left-0 right-0 flex justify-center pointer-events-none">
                    <span
                        className="text-[10px] font-medium tracking-tight px-2 py-0.5 rounded-full backdrop-blur-sm"
                        style={{ color: accentColor, background: isWellness ? 'transparent' : 'rgba(41,59,100,0.8)' }}
                    >
                        {progressLabel}
                    </span>
                </div>
            )}
        </div>

    );
};

export default PublicHeader;

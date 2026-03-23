import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface PublicHeaderProps {
    title?: string;
    subtitle?: string;
    onBack?: () => void;
    showBack?: boolean;
    progress?: number; // 0-100
    progressLabel?: string; // e.g., "Grupo 2 de 5"
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({
    title,
    onBack,
    showBack,
    progress,
    progressLabel
}) => {
    return (
        <div className="w-full h-[56px] bg-[#293B64] flex flex-col relative shrink-0">
            <div className="flex items-center h-full px-4">
                {/* Left Section */}
                <div className="w-9">
                    {showBack && onBack && (
                        <button
                            onClick={onBack}
                            className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/15 rounded-full transition-colors"
                            aria-label="Volver"
                        >
                            <ChevronLeft size={20} className="text-white/80" />
                        </button>
                    )}
                </div>

                {/* Center Section */}
                <div className="flex-1 flex justify-center text-center overflow-hidden">
                    {title ? (
                        <span className="text-[13px] font-semibold text-white/90 truncate px-2">
                            {title}
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
                <div className="w-full h-[3px] bg-white/10 relative overflow-hidden">
                    <div
                        className="h-full bg-[#23BCEF] transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Progress Label */}
            {progressLabel && progress !== undefined && (
                <div className="absolute top-[59px] left-0 right-0 flex justify-center pointer-events-none">
                    <span className="text-[10px] text-[#23BCEF] font-medium tracking-tight bg-[#293B64]/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {progressLabel}
                    </span>
                </div>
            )}
        </div>
    );
};

export default PublicHeader;

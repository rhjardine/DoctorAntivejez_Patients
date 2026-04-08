import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

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

    // Vytalix (Organic/Wellness) vs Clinical (Professional)
    const bgColor = isWellness ? 'bg-vytalix-graphite' : 'bg-clinical-navy';
    const accentColorClass = isWellness ? 'bg-vytalix-sage' : 'bg-clinical-cyan';
    const accentColorHex = isWellness ? '#5A7163' : '#06B6D4';
    const textColor = isWellness ? 'text-vytalix-sand' : 'text-white';

    return (
        <div className={`w-full h-[60px] flex flex-col relative shrink-0 z-50 shadow-md ${bgColor}`}>
            <div className="flex items-center h-full px-5">
                {/* Left Section */}
                <div className="w-10">
                    {showBack && onBack && (
                        <button
                            onClick={onBack}
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 ${isWellness ? 'bg-white/5 hover:bg-white/10' : 'bg-white/10 hover:bg-white/20'
                                }`}
                            aria-label="Volver"
                        >
                            <ChevronLeft size={22} className={textColor} />
                        </button>
                    )}
                </div>

                {/* Center Section */}
                <div className="flex-1 flex justify-center text-center overflow-hidden">
                    {title ? (
                        <span className={`text-[14px] font-black uppercase tracking-widest truncate px-4 ${textColor}`}>
                            {title}
                        </span>
                    ) : isWellness ? (
                        <span className={`text-[14px] font-black tracking-[0.4em] ${textColor}`}>
                            VYTALIX
                        </span>
                    ) : (
                        <img src="/Logo_azul_oscuro.png" alt="Doctor Antivejez" className="h-8 w-auto brightness-200" />
                    )}
                </div>

                {/* Right Section (Spacer) */}
                <div className="w-10" />
            </div>

            {/* Progress Bar */}
            {progress !== undefined && (
                <div className={`w-full h-[4px] relative overflow-hidden ${isWellness ? 'bg-white/5' : 'bg-white/10'}`}>
                    <motion.div
                        className={`h-full ${accentColorClass}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            )}

            {/* Progress Label */}
            {progressLabel && progress !== undefined && (
                <div className="absolute top-[64px] left-0 right-0 flex justify-center pointer-events-none">
                    <span
                        className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md shadow-sm border ${isWellness
                            ? 'text-vytalix-sage bg-vytalix-sand/10 border-vytalix-sage/20'
                            : 'text-clinical-cyan bg-clinical-navy/80 border-clinical-cyan/20'
                            }`}
                    >
                        {progressLabel}
                    </span>
                </div>
            )}
        </div>
    );
};

export default PublicHeader;

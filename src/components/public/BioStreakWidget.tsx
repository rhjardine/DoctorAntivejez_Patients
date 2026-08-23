import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BioStreakService, StreakData } from '../../services/BioStreakService';

interface Props {
    compact?: boolean;
}

export default function BioStreakWidget({ compact = false }: Props) {
    const [streak, setStreak] = useState<StreakData | null>(null);

    useEffect(() => {
        setStreak(BioStreakService.getCurrentStreak());
        const handleStorage = () => setStreak(BioStreakService.getCurrentStreak());
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    if (!streak || streak.currentStreak === 0) return null; // Only show if they have a streak starting or compact

    const { days, message } = BioStreakService.getNextMilestone(streak.currentStreak);

    if (compact) {
        return (
            <div className="inline-flex items-center gap-2 bg-[#293B64] border border-[#23bcef]/30 shadow-lg shadow-[#293B64]/10 rounded-full px-3.5 py-1.5 flex-wrap">
                <span className="text-lg">🔥</span>
                <span className="text-white font-black text-sm whitespace-nowrap">{streak.currentStreak} días</span>
                <span className="text-white/40 text-[10px] sm:text-xs">·</span>
                <span className="text-[#107da8] font-medium text-[10px] sm:text-xs truncate max-w-[100px] sm:max-w-[140px]">{message}</span>
            </div>
        );
    }

    // Generate 28 days for grid
    const today = new Date();
    const historyMap = new Set(streak.pulseHistory.map(p => p.date));
    const grid = Array.from({ length: 28 }).map((_, i) => {
        const d = new Date(today.getTime() - (27 - i) * 86400000);
        const dateStr = d.toISOString().split('T')[0];
        return historyMap.has(dateStr);
    });

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-5 w-full relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-sm font-bold text-[#293b64] uppercase tracking-wide flex items-center gap-1.5">
                        <span className="text-lg">🔥</span> Racha Activa
                    </h3>
                    <p className="text-gray-400 text-[11px] mt-0.5">Activando tu vitalidad consecutivamente</p>
                </div>
                <div className="text-[32px] font-black text-[#107da8] leading-none shrink-0 drop-shadow-sm">
                    {streak.currentStreak} <span className="text-sm text-[#107da8]/60">d</span>
                </div>
            </div>

            {/* Progress Bar towards Milestone */}
            <div className="mb-5">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-gray-600">Próximo logro</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full">{message}</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden shrink-0">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(5, (streak.currentStreak / (streak.currentStreak + days)) * 100))}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-[#23bcef] rounded-full"
                    />
                </div>
            </div>

            {/* 28 Day Grid - GitHub Contributions Style */}
            <div className="grid grid-cols-7 gap-1.5">
                {grid.map((isActive, i) => (
                    <div
                        key={i}
                        className={`aspect-square rounded-[4px] ${isActive ? 'bg-green-400' : 'bg-gray-100'}`}
                    />
                ))}
            </div>
        </div>
    );
}

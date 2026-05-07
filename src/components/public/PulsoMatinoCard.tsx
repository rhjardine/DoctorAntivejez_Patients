import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { BioStreakService, PulseEntry } from '../../services/BioStreakService';

interface Props {
    onComplete?: (value: number) => void;
}

export default function PulsoMatinoCard({ onComplete }: Props) {
    const [isRegistered, setIsRegistered] = useState(false);
    const [history, setHistory] = useState<PulseEntry[]>([]);

    useEffect(() => {
        setIsRegistered(BioStreakService.isPulseRegisteredToday());
        setHistory(BioStreakService.getCurrentStreak().pulseHistory);
    }, []);

    const handlePulse = (value: 1 | 2 | 3 | 4 | 5) => {
        BioStreakService.recordPulse(value);
        setIsRegistered(true);
        setHistory(BioStreakService.getCurrentStreak().pulseHistory);
        onComplete?.(value);
    };

    const getEmojiAndColor = (val: number) => {
        switch (val) {
            case 1: return { emoji: '😴', bg: 'bg-red-500/20 text-red-500', base: 'bg-red-500' };
            case 2: return { emoji: '😐', bg: 'bg-amber-500/20 text-amber-500', base: 'bg-amber-500' };
            case 3: return { emoji: '🙂', bg: 'bg-cyan-500/20 text-cyan-500', base: 'bg-cyan-500' };
            case 4: return { emoji: '😊', bg: 'bg-green-500/20 text-green-500', base: 'bg-green-500' };
            case 5: default: return { emoji: '🔥', bg: 'bg-cyan-500 text-white', base: 'bg-cyan-500' };
        }
    };

    if (isRegistered) {
        const last7 = [...history].slice(0, 7).reverse(); // oldest to newest
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-[20px] p-4 flex items-center justify-between w-full shadow-sm"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-inner">
                        <Check size={16} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-semibold text-green-800">Pulso del día registrado</span>
                </div>
                <div className="flex items-end gap-1.5 h-8">
                    {last7.map((entry, idx) => {
                        const h = (entry.value / 5) * 100;
                        const c = getEmojiAndColor(entry.value).base;
                        return (
                            <div key={idx} className="w-2 rounded-full bg-green-200/50 h-full flex items-end overflow-hidden">
                                <div className={`w-full rounded-full ${c}`} style={{ height: `${h}%` }} />
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#293B64] border border-cyan-400/30 rounded-[20px] p-5 w-full shadow-lg relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

            <h3 className="text-[14px] text-white/90 font-medium mb-4 text-center">Buenos días · ¿Cómo amaneciste hoy?</h3>
            <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((val) => {
                    const { emoji, bg } = getEmojiAndColor(val);
                    const isMax = val === 5;
                    return (
                        <motion.button
                            key={val}
                            whileTap={{ scale: 1.3 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => handlePulse(val as 1 | 2 | 3 | 4 | 5)}
                            className={`w-12 h-12 flex items-center justify-center rounded-full text-xl ${bg} ${isMax ? 'shadow-lg shadow-cyan-500/30' : ''}`}
                        >
                            {isMax ? (
                                <motion.span
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >{emoji}</motion.span>
                            ) : (
                                emoji
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
}

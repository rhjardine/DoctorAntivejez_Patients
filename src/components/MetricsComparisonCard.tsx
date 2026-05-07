import React from 'react';
import { COLORS } from '../types';
import { TrendingDown, Award, Calendar, Zap } from 'lucide-react';

interface MetricsComparisonCardProps {
  bioAge: number;
  chronoAge: number;
  adherence: number;
}

const MetricsComparisonCard: React.FC<MetricsComparisonCardProps> = ({ bioAge, chronoAge, adherence }) => {
  const yearsGained = chronoAge - bioAge;
  const isRejuvenating = yearsGained > 0;

  return (
    <div className="mx-4 bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-slate-700 mt-4 relative overflow-hidden transition-all duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
         <Zap size={120} />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl text-primary">
              <Calendar size={20} />
            </div>
            <h3 className="font-bold text-darkBlue dark:text-white text-base">Estado de Longevidad</h3>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full flex items-center gap-1 border border-green-100 dark:border-green-800">
             <TrendingDown size={14} className="text-accentGreen" />
             <span className="text-[10px] font-black text-accentGreen uppercase">Evolución Positiva</span>
          </div>
        </div>

        {/* Big Numbers Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-textLight uppercase tracking-widest">Tu Edad Biológica</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-primary">{bioAge}</span>
              <span className="text-xs font-bold text-textMedium">AÑOS</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[11px] font-bold text-textLight uppercase tracking-widest text-right">Años Rejuvenecidos</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-accentGreen">+{yearsGained}</span>
              <span className="text-xs font-bold text-textMedium">EXITO</span>
            </div>
          </div>
        </div>

        {/* Adherence / Excellence Level */}
        <div className="bg-darkBlue rounded-2xl p-4 flex items-center justify-between text-white shadow-inner">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full border-4 border-primary/30 flex items-center justify-center relative">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle 
                    cx="24" cy="24" r="20" 
                    fill="transparent" 
                    stroke="rgba(35, 188, 239, 0.2)" 
                    strokeWidth="4"
                  />
                  <circle 
                    cx="24" cy="24" r="20" 
                    fill="transparent" 
                    stroke="#23BCEF" 
                    strokeWidth="4"
                    strokeDasharray={125.6}
                    strokeDashoffset={125.6 - (adherence / 100) * 125.6}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-[10px] font-black">{adherence}%</span>
             </div>
             <div>
                <h4 className="font-bold text-sm leading-tight">Nivel de Excelencia</h4>
                <p className="text-[10px] text-white/60 font-medium">Cumplimiento de Guía Médica</p>
             </div>
          </div>
          <Award size={24} className="text-accentYellow" fill={COLORS.AccentYellow} />
        </div>
      </div>
    </div>
  );
};

export default MetricsComparisonCard;
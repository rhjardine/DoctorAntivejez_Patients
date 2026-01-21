
import React from 'react';
import { Info, Zap } from 'lucide-react';

interface BiologicalAgeGaugeProps {
  biologicalAge: number;
  chronologicalAge: number;
  completedItems: number;
  totalItems: number;
  onInfoPress?: () => void;
}

const BiologicalAgeGauge: React.FC<BiologicalAgeGaugeProps> = ({ 
  biologicalAge, 
  chronologicalAge,
  completedItems, 
  totalItems,
  onInfoPress
}) => {
  // Lógica de Septenios: 7-28 (Verde), 28-49 (Amarillo), 49-70 (Naranja), 70-120 (Rojo)
  const calculatePosition = (age: number) => {
    if (age <= 7) return 0;
    if (age >= 120) return 100;
    
    // 0-25%: 7 a 28
    if (age <= 28) return ((age - 7) / 21) * 25;
    // 25-50%: 28 a 49
    if (age <= 49) return 25 + ((age - 28) / 21) * 25;
    // 50-75%: 49 a 70
    if (age <= 70) return 50 + ((age - 49) / 21) * 25;
    // 75-100%: 70 a 120
    return 75 + ((age - 70) / 50) * 25;
  };

  const percentagePosition = calculatePosition(biologicalAge);
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const yearsDifference = chronologicalAge - biologicalAge;
  const isOptimal = yearsDifference > 0;

  return (
    <div className="w-full px-6 py-5 bg-white border-b border-slate-100 shadow-sm animate-in fade-in slide-in-from-top duration-700">
      <div className="flex justify-between items-end mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Estado Biofísico Actual
             </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] font-bold text-darkBlue uppercase">Edad Bio:</span>
            <span className="text-2xl font-black text-primary leading-none">{biologicalAge}</span>
            <span className="text-sm font-bold text-slate-300">/ {chronologicalAge}</span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
             {onInfoPress && (
               <button 
                 onClick={onInfoPress}
                 className="p-1.5 bg-slate-50 text-slate-300 rounded-lg hover:text-primary transition-colors"
               >
                 <Info size={14} />
               </button>
             )}
             <div className="bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
               <span className="text-[9px] font-black text-emerald-600 uppercase">Score: {adherenceLabel(progressPercentage)}</span>
             </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter">
             {isOptimal ? (
               <span className="text-emerald-500">+{yearsDifference} años de vitalidad</span>
             ) : (
               <span className="text-amber-500">{Math.abs(yearsDifference)} años de rezago</span>
             )}
          </div>
        </div>
      </div>
      
      {/* Barra de Septenios Gradiente Segmentada */}
      <div className="relative h-12 mt-2">
        <div className="h-4 w-full flex rounded-full overflow-hidden shadow-inner bg-slate-100 border border-slate-200">
          <div className="h-full bg-emerald-500 border-r border-white/20" style={{ width: '25%' }}></div>
          <div className="h-full bg-yellow-400 border-r border-white/20" style={{ width: '25%' }}></div>
          <div className="h-full bg-orange-400 border-r border-white/20" style={{ width: '25%' }}></div>
          <div className="h-full bg-rose-500" style={{ width: '25%' }}></div>
        </div>

        {/* Marcadores de Escala */}
        <div className="absolute w-full flex justify-between text-[9px] text-slate-400 mt-2 font-black uppercase tracking-widest">
          <span>7</span>
          <span className="absolute left-[25%] -translate-x-1/2">28</span>
          <span className="absolute left-[50%] -translate-x-1/2">49</span>
          <span className="absolute left-[75%] -translate-x-1/2">70</span>
          <span>120</span>
        </div>

        {/* Indicador Biofísico (Pointer) */}
        <div 
          className="absolute top-0 transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) z-10 flex flex-col items-center"
          style={{ left: `${percentagePosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="bg-darkBlue w-1 h-6 rounded-full shadow-lg"></div>
          <div className="bg-darkBlue text-white text-[8px] font-black px-1.5 py-0.5 rounded-md mt-1 shadow-md border border-white/10 uppercase">
             Tú
          </div>
        </div>
      </div>
    </div>
  );
};

function adherenceLabel(pct: number) {
    if (pct >= 90) return 'Elite';
    if (pct >= 70) return 'Óptimo';
    if (pct >= 50) return 'En Proceso';
    return 'Iniciando';
}

export default BiologicalAgeGauge;

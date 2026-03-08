
import React from 'react';
import { Info, Zap } from 'lucide-react';

interface BiologicalAgeGaugeProps {
  biologicalAge: number | string;
  chronologicalAge: number | string;
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
  // Lógica Revisada: 7-28 (Verde), 28-70 (Amarillo), 70-120 (Rojo)
  const calculatePosition = (ageVal: number | string) => {
    const age = Number(ageVal);
    if (isNaN(age)) return 0; // Handle '--' or empty fallback
    if (age <= 7) return 0;
    if (age >= 120) return 100;

    // Verde: 7 a 28 (0% - 33.3%)
    if (age <= 28) return ((age - 7) / 21) * 33.33;
    // Amarillo: 28 a 70 (33.3% - 66.6%)
    if (age <= 70) return 33.33 + ((age - 28) / 42) * 33.33;
    // Rojo: 70 a 120 (66.6% - 100%)
    return 66.66 + ((age - 70) / 50) * 33.33;
  };

  const percentagePosition = calculatePosition(biologicalAge);
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const bio = Number(biologicalAge);
  const chrono = Number(chronologicalAge);
  const yearsDifference = (!isNaN(chrono) && !isNaN(bio)) ? chrono - bio : 0;
  const isOptimal = yearsDifference > 0;


  return (
    <div className="w-full px-6 py-2.5 bg-white border-b border-slate-100 shadow-sm animate-in fade-in slide-in-from-top duration-700">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Estado Biofísico Actual
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] font-bold text-darkBlue uppercase">Edad Bio:</span>
            <span className="text-xl font-black text-primary leading-none">{biologicalAge}</span>
            <span className="text-xs font-bold text-slate-300">/ {chronologicalAge}</span>
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

      {/* Barra de Septenios Gradiente Segmentada (Verde, Amarillo, Rojo) */}
      <div className="relative h-9 mt-1">
        <div className="h-2.5 w-full flex rounded-full overflow-hidden shadow-inner bg-slate-100 border border-slate-200">
          <div className="h-full bg-emerald-500 border-r border-white/20" style={{ width: '33.33%' }}></div>
          <div className="h-full bg-yellow-400 border-r border-white/20" style={{ width: '33.33%' }}></div>
          <div className="h-full bg-rose-500" style={{ width: '33.34%' }}></div>
        </div>

        {/* Marcadores de Escala */}
        <div className="absolute w-full flex justify-between text-[9px] text-slate-400 mt-2 font-black uppercase tracking-widest">
          <span>7</span>
          <span className="absolute left-[33.33%] -translate-x-1/2">28</span>
          <span className="absolute left-[66.66%] -translate-x-1/2">70</span>
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

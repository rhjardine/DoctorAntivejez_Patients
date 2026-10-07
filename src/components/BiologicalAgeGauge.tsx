
import React from 'react';
import { Info } from 'lucide-react';

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

  const bioPercentage = calculatePosition(biologicalAge);
  const chronoPercentage = calculatePosition(chronologicalAge);

  const bio = Number(biologicalAge);
  const chrono = Number(chronologicalAge);
  const yearsDifference = (!isNaN(chrono) && !isNaN(bio)) ? chrono - bio : 0;
  const isOptimal = yearsDifference > 0;

  /**
   * Las dos etiquetas van encima de la barra y los números de la escala debajo:
   * antes compartían banda y «Tú (62)» tapaba el 70 de la escala.
   *
   * Si las dos edades caen cerca, las etiquetas se pisarían entre sí. Cuando
   * eso ocurre, la de referencia sube una altura para que ambas se lean.
   */
  const etiquetasCerca =
    !isNaN(bio) && !isNaN(chrono) && Math.abs(bioPercentage - chronoPercentage) < 20;

  return (
    <div className="w-full px-5 py-2 bg-white border-b border-slate-100 shadow-sm animate-in fade-in slide-in-from-top duration-700">
      <div className="flex justify-between items-start gap-3">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0"></div>
            <span className="text-[calc(12px*var(--escala-texto,1))] font-black text-slate-500 tracking-tight">
              Estado Biofísico
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-[calc(13px*var(--escala-texto,1))] font-bold text-darkBlue">Edad Bio:</span>
            <span className="text-xl font-black text-brand-cyanInk leading-none">{biologicalAge}</span>
            <span className="text-xs font-bold text-slate-500">/ {chronologicalAge} real</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[calc(12px*var(--escala-texto,1))] font-black tracking-tight text-right">
            {isOptimal ? (
              <span className="text-emerald-700">+{yearsDifference} años de vitalidad</span>
            ) : (
              <span className="text-amber-700">{Math.abs(yearsDifference)} años de rezago</span>
            )}
          </span>
          {onInfoPress && (
            <button
              aria-label="Qué significa la edad biológica"
              onClick={onInfoPress}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-slate-50 text-slate-500 rounded-lg hover:text-primary transition-colors shrink-0"
            >
              <Info size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Barra de septenios. Etiquetas arriba, escala abajo: así no se solapan. */}
      <div className="relative mt-5 mb-1">
        {/* Etiquetas de posición, ancladas por su base al borde superior de la barra */}
        {!isNaN(chrono) && (
          <div
            className="absolute bottom-full flex flex-col items-center z-0 transition-all duration-1000"
            style={{
              left: `${chronoPercentage}%`,
              transform: 'translateX(-50%)',
              marginBottom: etiquetasCerca ? 18 : 2,
            }}
          >
            <span className="bg-slate-100 text-slate-600 text-[calc(12px*var(--escala-texto,1))] font-bold px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap">
              Ref {chrono}
            </span>
            <span className="w-0.5 h-1.5 bg-slate-300 rounded-full" />
          </div>
        )}

        {!isNaN(bio) && (
          <div
            className="absolute bottom-full flex flex-col items-center z-10 transition-all duration-1000"
            style={{ left: `${bioPercentage}%`, transform: 'translateX(-50%)', marginBottom: 2 }}
          >
            <span className="bg-darkBlue text-white text-[calc(12px*var(--escala-texto,1))] font-black px-1.5 py-0.5 rounded-md shadow-sm whitespace-nowrap">
              Tú {bio}
            </span>
            <span className="w-0.5 h-1.5 bg-darkBlue rounded-full" />
          </div>
        )}

        <div className="h-2.5 w-full flex rounded-full overflow-hidden shadow-inner bg-slate-100 border border-slate-200">
          <div className="h-full bg-emerald-500 border-r border-white/20" style={{ width: '33.33%' }}></div>
          <div className="h-full bg-yellow-400 border-r border-white/20" style={{ width: '33.33%' }}></div>
          <div className="h-full bg-rose-500" style={{ width: '33.34%' }}></div>
        </div>

        {/* Escala, debajo de la barra y ya sin nada encima */}
        <div className="relative w-full h-4 mt-1 text-[calc(12px*var(--escala-texto,1))] text-slate-500 font-bold">
          <span className="absolute left-0">7</span>
          <span className="absolute left-[33.33%] -translate-x-1/2">28</span>
          <span className="absolute left-[66.66%] -translate-x-1/2">70</span>
          <span className="absolute right-0">120</span>
        </div>
      </div>
    </div>
  );
};

export default BiologicalAgeGauge;

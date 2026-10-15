
import React, { useEffect, useRef, useState } from 'react';
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
  const hayBio = !isNaN(bio);
  const hayChrono = !isNaN(chrono);
  const yearsDifference = (hayChrono && hayBio) ? chrono - bio : 0;
  const isOptimal = yearsDifference > 0;

  /**
   * Las dos etiquetas van en carriles propios —«Ref» arriba, «Tú» justo encima
   * de la barra— y la escala debajo.
   *
   * El intento anterior las dejaba en la misma banda y solo levantaba «Ref» 18px
   * cuando las edades quedaban a menos de 20 puntos porcentuales. Medido en el
   * navegador, eso no bastaba: 18px es menos que la altura de la propia etiqueta,
   * así que los pares cercanos (62/78, 78/87, 45/47, 70/70, 9/12, 28/29, 110/118)
   * seguían pisándose en 320–414px y en las cuatro escalas de texto. Con un carril
   * para cada una el solape vertical deja de ser posible por construcción, sin
   * depender de cuánto mida el texto.
   */
  const carrilRef = useRef<HTMLSpanElement>(null);
  const carrilTu = useRef<HTMLSpanElement>(null);
  const barraRef = useRef<HTMLDivElement>(null);
  const [anchos, setAnchos] = useState({ barra: 0, ref: 0, tu: 0 });

  useEffect(() => {
    // `offsetWidth` y no `getBoundingClientRect()`: HomePage monta este marcador
    // dentro de una animación de framer-motion que arranca en `scale: 0.98`, y
    // el rect viene ya transformado. Medido así, la barra daba 343px en lugar de
    // 350 y cada etiqueta quedaba ~5px a la izquierda de su marcador; como la
    // caja de maquetación no cambia, el ResizeObserver nunca lo corregía.
    const medir = () => {
      const barra = barraRef.current?.offsetWidth ?? 0;
      const ref = carrilRef.current?.offsetWidth ?? 0;
      const tu = carrilTu.current?.offsetWidth ?? 0;
      setAnchos((previo) =>
        Math.abs(previo.barra - barra) < 0.5 &&
        Math.abs(previo.ref - ref) < 0.5 &&
        Math.abs(previo.tu - tu) < 0.5
          ? previo
          : { barra, ref, tu },
      );
    };
    medir();
    if (typeof ResizeObserver === 'undefined') return;
    const observador = new ResizeObserver(medir);
    [barraRef.current, carrilRef.current, carrilTu.current].forEach(
      (nodo) => nodo && observador.observe(nodo),
    );
    return () => observador.disconnect();
  }, [biologicalAge, chronologicalAge]);

  /**
   * Mantiene la etiqueta dentro de la barra.
   *
   * Centrada sobre su posición, una edad de 118 o 119 empujaba «Ref» fuera de la
   * tarjeta y de la pantalla (medido: 361..417px en un viewport de 414px). Aquí
   * se recorta en píxeles reales; el marcador sobre la barra sí queda en la
   * posición exacta, de modo que la lectura no pierde precisión.
   */
  const izquierdaSegura = (porcentaje: number, anchoEtiqueta: number): string => {
    if (!anchos.barra || !anchoEtiqueta) return `${porcentaje}%`;
    if (anchoEtiqueta >= anchos.barra) return '50%';
    const mitad = anchoEtiqueta / 2;
    const centro = (porcentaje / 100) * anchos.barra;
    return `${Math.min(Math.max(centro, mitad), anchos.barra - mitad)}px`;
  };

  const ESTILO_REF =
    'bg-slate-100 text-slate-600 text-[calc(12px*var(--escala-texto,1))] font-bold px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap';
  const ESTILO_TU =
    'bg-darkBlue text-white text-[calc(12px*var(--escala-texto,1))] font-black px-1.5 py-0.5 rounded-md shadow-sm whitespace-nowrap';

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

        {/* La columna no puede ser `shrink-0`: con la escala máxima en 320px y una
            brecha grande entre edades, «+111 años de vitalidad» se montaba sobre
            «Estado Biofísico». Ahora cede ancho y el texto parte de línea. */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[calc(12px*var(--escala-texto,1))] font-black tracking-tight text-right min-w-0 break-words">
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

      <div className="mt-3 mb-1">
        {/* Carril de «Ref». El span invisible reserva la altura de la fila con la
            tipografía vigente, así el carril crece con la escala de texto sin
            números mágicos. */}
        {hayChrono && (
          <div className="relative">
            <span ref={carrilRef} aria-hidden="true" className={`invisible inline-block ${ESTILO_REF}`}>
              Ref {chrono}
            </span>
            <span
              className={`absolute top-0 transition-all duration-700 ${ESTILO_REF}`}
              style={{ left: izquierdaSegura(chronoPercentage, anchos.ref), transform: 'translateX(-50%)' }}
            >
              Ref {chrono}
            </span>
          </div>
        )}

        {/* Carril de «Tú», pegado a la barra */}
        {hayBio && (
          <div className="relative mt-0.5">
            <span ref={carrilTu} aria-hidden="true" className={`invisible inline-block ${ESTILO_TU}`}>
              Tú {bio}
            </span>
            <span
              className={`absolute top-0 transition-all duration-700 ${ESTILO_TU}`}
              style={{ left: izquierdaSegura(bioPercentage, anchos.tu), transform: 'translateX(-50%)' }}
            >
              Tú {bio}
            </span>
          </div>
        )}

        {/* Barra de septenios con los marcadores exactos encima */}
        <div ref={barraRef} className="relative mt-1">
          <div className="h-2.5 w-full flex rounded-full overflow-hidden shadow-inner bg-slate-100 border border-slate-200">
            <div className="h-full bg-emerald-500 border-r border-white/20" style={{ width: '33.33%' }}></div>
            <div className="h-full bg-yellow-400 border-r border-white/20" style={{ width: '33.33%' }}></div>
            <div className="h-full bg-rose-500" style={{ width: '33.34%' }}></div>
          </div>

          {hayChrono && (
            <span
              aria-hidden="true"
              className="absolute -top-1 h-[18px] w-[2px] bg-slate-500 rounded-full transition-all duration-700"
              style={{ left: `${chronoPercentage}%`, transform: 'translateX(-50%)' }}
            />
          )}
          {hayBio && (
            <span
              aria-hidden="true"
              className="absolute -top-1.5 h-[22px] w-[3px] bg-darkBlue rounded-full ring-2 ring-white transition-all duration-700"
              style={{ left: `${bioPercentage}%`, transform: 'translateX(-50%)' }}
            />
          )}
        </div>

        {/* Escala, debajo de la barra y ya sin nada encima */}
        <div className="relative w-full h-4 mt-2 text-[calc(12px*var(--escala-texto,1))] text-slate-500 font-bold">
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


import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Info } from 'lucide-react';

interface BiologicalAgeGaugeProps {
  biologicalAge: number | string;
  chronologicalAge: number | string;
  completedItems: number;
  totalItems: number;
  onInfoPress?: () => void;
}

/** Separación mínima entre las dos etiquetas cuando comparten carril. */
const SEPARACION = 6;

export interface PosicionEtiquetas {
  /** Centro de «Ref», en píxeles desde el borde izquierdo de la barra. */
  ref: number;
  /** Centro de «Tú», en píxeles. */
  tu: number;
  /** `true` cuando no caben una al lado de la otra y hay que apilarlas. */
  apilado: boolean;
}

/**
 * Coloca las dos etiquetas en un solo carril sin que se toquen.
 *
 * Antes ocupaban dos filas —una cada una— para garantizar por construcción que
 * no se pisaran. Eso costaba ~23px de alto en una tarjeta que el médico pide
 * encoger. Con los anchos reales medidos se puede resolver el choque de forma
 * exacta en vez de por construcción: si los centros quedan más cerca de lo que
 * sus mitades permiten, se separan justo lo necesario y después se sujetan
 * dentro de la barra, desplazando a las dos si una topa con el borde.
 *
 * Solo si ni siquiera caben una junto a otra —texto enorme en una pantalla muy
 * estrecha— se vuelve al apilado, que sigue siendo correcto.
 */
export const calcularPosicionesEtiquetas = (
  anchoBarra: number,
  porcentajeRef: number,
  porcentajeTu: number,
  anchoRef: number,
  anchoTu: number,
): PosicionEtiquetas => {
  const aPx = (p: number) => (p / 100) * anchoBarra;
  const sujetar = (x: number, ancho: number) =>
    Math.min(Math.max(x, ancho / 2), anchoBarra - ancho / 2);

  if (anchoRef + anchoTu + SEPARACION > anchoBarra) {
    return { ref: aPx(porcentajeRef), tu: aPx(porcentajeTu), apilado: true };
  }

  // 1. Cada una dentro de la barra, por su cuenta.
  let centroRef = sujetar(aPx(porcentajeRef), anchoRef);
  let centroTu = sujetar(aPx(porcentajeTu), anchoTu);

  const minima = (anchoRef + anchoTu) / 2 + SEPARACION;
  const distancia = centroTu - centroRef;
  if (Math.abs(distancia) >= minima) {
    return { ref: centroRef, tu: centroTu, apilado: false };
  }

  // 2. Se tocan: separarlas a la distancia mínima desde su punto medio.
  //    Con las edades iguales la distancia es 0 y no hay lado hacia el que
  //    separarse: se decide uno para que la colocación no quede indefinida.
  const signo = distancia === 0 ? 1 : Math.sign(distancia);
  const medio = (centroRef + centroTu) / 2;
  centroRef = medio - (signo * minima) / 2;
  centroTu = medio + (signo * minima) / 2;

  // 3. Ya van enlazadas a distancia fija, así que para encajarlas hay que mover
  //    el par entero: sujetar solo a la que topa volvería a juntarlas. El par
  //    mide `anchoRef + anchoTu + SEPARACION`, que arriba comprobamos que cabe,
  //    de modo que un único desplazamiento satisface los dos bordes.
  const tuEsDerecha = signo > 0;
  const centroDerecha = tuEsDerecha ? centroTu : centroRef;
  const anchoDerecha = tuEsDerecha ? anchoTu : anchoRef;
  const centroIzquierda = tuEsDerecha ? centroRef : centroTu;
  const anchoIzquierda = tuEsDerecha ? anchoRef : anchoTu;

  let ajuste = 0;
  const excesoDerecha = centroDerecha + anchoDerecha / 2 - anchoBarra;
  if (excesoDerecha > 0) ajuste -= excesoDerecha;
  const excesoIzquierda = anchoIzquierda / 2 - (centroIzquierda + ajuste);
  if (excesoIzquierda > 0) ajuste += excesoIzquierda;

  return { ref: centroRef + ajuste, tu: centroTu + ajuste, apilado: false };
};

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
   * Mientras no haya medidas —primer render, o un entorno sin layout— se cae al
   * porcentaje puro. Es la posición correcta; lo único que falta es el ajuste
   * para que no se toquen, y llega en el render siguiente.
   */
  const sinMedidas = !anchos.barra || !anchos.ref || !anchos.tu;
  const colocacion = useMemo(() => {
    if (sinMedidas || !hayBio || !hayChrono) return null;
    return calcularPosicionesEtiquetas(
      anchos.barra, chronoPercentage, bioPercentage, anchos.ref, anchos.tu,
    );
  }, [sinMedidas, hayBio, hayChrono, anchos, chronoPercentage, bioPercentage]);

  const izquierdaDe = (cual: 'ref' | 'tu'): string => {
    const porcentaje = cual === 'ref' ? chronoPercentage : bioPercentage;
    if (colocacion) return `${colocacion[cual]}px`;
    // Una sola etiqueta: basta con sujetarla dentro de la barra.
    const ancho = cual === 'ref' ? anchos.ref : anchos.tu;
    if (!anchos.barra || !ancho || ancho >= anchos.barra) return `${porcentaje}%`;
    const centro = (porcentaje / 100) * anchos.barra;
    return `${Math.min(Math.max(centro, ancho / 2), anchos.barra - ancho / 2)}px`;
  };

  const apilado = colocacion?.apilado ?? false;

  const ESTILO_REF =
    'bg-slate-100 text-slate-600 text-[calc(12px*var(--escala-texto,1))] font-bold px-1.5 py-0.5 rounded border border-slate-200 whitespace-nowrap';
  const ESTILO_TU =
    'bg-darkBlue text-white text-[calc(12px*var(--escala-texto,1))] font-black px-1.5 py-0.5 rounded-md shadow-sm whitespace-nowrap';

  /**
   * Marcadores sobre la barra: rombos en vez de las barritas verticales de
   * antes. Un rombo con aro blanco se distingue sobre cualquiera de los tres
   * tramos de color sin añadir peso visual, y marca el punto exacto con su
   * vértice. El de «Tú» es mayor y macizo; el de referencia, menor y hueco.
   */
  const rombo = (relleno: string, borde: string, lado: number): React.CSSProperties => ({
    width: lado,
    height: lado,
    backgroundColor: relleno,
    border: `1.5px solid ${borde}`,
    borderRadius: 2,
    boxShadow: '0 0 0 2px #fff, 0 1px 2px rgba(15,23,42,.25)',
  });

  return (
    <div className="w-full px-5 pt-1.5 pb-2 bg-white border-b border-slate-100 shadow-sm animate-in fade-in slide-in-from-top duration-700">
      {/* Fila de apoyo: el rótulo y el saldo de años, los dos texto secundario.
          Juntarlos aquí libera el ancho completo para las edades, que es lo que
          el paciente viene a leer. Antes competían por la misma línea y el
          número grande se quedaba huérfano al final de la columna. */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0"></div>
          <span className="text-[calc(12px*var(--escala-texto,1))] font-black text-slate-500 tracking-tight leading-tight">
            Estado Biofísico
          </span>
        </div>
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[calc(12px*var(--escala-texto,1))] font-black tracking-tight text-right min-w-0 leading-tight">
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
              /* 28px a la vista y 44px de zona táctil: el pseudoelemento amplía
                 el área sin ocupar sitio en la maquetación. */
              className="relative w-7 h-7 flex items-center justify-center bg-slate-50 text-slate-500 rounded-lg hover:text-primary transition-colors shrink-0 after:absolute after:content-[''] after:-inset-2"
            >
              <Info size={15} />
            </button>
          )}
        </div>
      </div>

      {/* La cronológica primero y en pequeño, la biológica después y grande: es
          la que el tratamiento mueve, y la que el paciente viene a ver. Cada
          rótulo viaja pegado a su número para que al partir de línea no quede
          una cifra suelta sin saber de qué es. */}
      <div className="flex items-baseline gap-x-2 gap-y-0 flex-wrap leading-none mt-0.5">
        <span className="whitespace-nowrap">
          <span className="text-[calc(12px*var(--escala-texto,1))] font-bold text-slate-500">Cronológica </span>
          <span className="text-[calc(16px*var(--escala-texto,1))] font-bold text-slate-600">{chronologicalAge}</span>
        </span>
        <span className="text-slate-300" aria-hidden="true">·</span>
        <span className="whitespace-nowrap">
          <span className="text-[calc(12px*var(--escala-texto,1))] font-bold text-darkBlue">Biológica </span>
          <span className="text-[calc(24px*var(--escala-texto,1))] font-black text-brand-cyanInk">{biologicalAge}</span>
        </span>
      </div>

      <div className="mt-1.5">
        {/* Un solo carril para las dos etiquetas. El span con un espacio duro
            reserva la altura de la fila con la tipografía vigente, así crece con
            la escala de texto sin números mágicos; los de medición van fuera del
            flujo para no sumar alto. */}
        <div className="relative">
          <span aria-hidden="true" className={`invisible inline-block ${ESTILO_TU}`}>&nbsp;</span>
          {/* Reserva de la segunda fila, solo cuando hace falta apilar. */}
          {apilado && <span aria-hidden="true" className={`invisible block ${ESTILO_TU}`}>&nbsp;</span>}

          {hayChrono && (
            <span
              ref={carrilRef}
              aria-hidden="true"
              className={`invisible absolute top-0 left-0 pointer-events-none ${ESTILO_REF}`}
            >
              Ref {chrono}
            </span>
          )}
          {hayBio && (
            <span
              ref={carrilTu}
              aria-hidden="true"
              className={`invisible absolute top-0 left-0 pointer-events-none ${ESTILO_TU}`}
            >
              Tú {bio}
            </span>
          )}

          {hayChrono && (
            <span
              className={`absolute top-0 transition-all duration-700 ${ESTILO_REF}`}
              style={{ left: izquierdaDe('ref'), transform: 'translateX(-50%)' }}
            >
              Ref {chrono}
            </span>
          )}
          {hayBio && (
            <span
              className={`absolute transition-all duration-700 ${ESTILO_TU}`}
              style={{
                left: izquierdaDe('tu'),
                top: apilado ? '100%' : 0,
                transform: apilado ? 'translate(-50%,-100%)' : 'translateX(-50%)',
              }}
            >
              Tú {bio}
            </span>
          )}
        </div>

        {/* Barra de septenios con los marcadores exactos encima */}
        <div ref={barraRef} className="relative mt-1.5">
          <div className="h-2.5 w-full flex rounded-full overflow-hidden shadow-inner bg-slate-100 border border-slate-200">
            <div className="h-full bg-emerald-500 border-r border-white/20" style={{ width: '33.33%' }}></div>
            <div className="h-full bg-yellow-400 border-r border-white/20" style={{ width: '33.33%' }}></div>
            <div className="h-full bg-rose-500" style={{ width: '33.34%' }}></div>
          </div>

          {hayChrono && (
            <span
              aria-hidden="true"
              className="absolute top-1/2 block transition-all duration-700"
              style={{
                ...rombo('#fff', '#64748b', 9),
                left: `${chronoPercentage}%`,
                transform: 'translate(-50%,-50%) rotate(45deg)',
              }}
            />
          )}
          {hayBio && (
            <span
              aria-hidden="true"
              className="absolute top-1/2 block transition-all duration-700"
              style={{
                ...rombo('#293B64', '#fff', 12),
                left: `${bioPercentage}%`,
                transform: 'translate(-50%,-50%) rotate(45deg)',
              }}
            />
          )}
        </div>

        {/* Escala, debajo de la barra y ya sin nada encima */}
        <div className="relative w-full h-3.5 mt-1.5 text-[calc(12px*var(--escala-texto,1))] text-slate-500 font-bold leading-none">
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

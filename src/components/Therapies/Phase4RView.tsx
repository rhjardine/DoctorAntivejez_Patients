import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Info } from 'lucide-react';
import { AVISO_4R, Terapia4R } from '../../config/therapies4R';
import WellnessDisclaimer from '../public/WellnessDisclaimer';

/**
 * Vista de una fase 4R.
 *
 * Las cuatro fases se explican con la misma estructura —qué persigue, en qué
 * consiste, con qué modalidades— para que el paciente aprenda a leerlas una
 * vez. El contenido llega desde `config/therapies4R.ts`; aquí no se escribe
 * ni una afirmación clínica.
 */

interface Phase4RViewProps {
    fase: Terapia4R;
    /** Color de acento de la fase. */
    acento: string;
    /** Fondo del encabezado. */
    fondo: string;
    icono: React.ReactNode;
    onBack?: () => void;
}

const Phase4RView: React.FC<Phase4RViewProps> = ({ fase, acento, fondo, icono, onBack }) => {
    return (
        <div className="flex flex-col w-full pb-32">

            {/* Encabezado de la fase */}
            <div
                className="mx-4 mt-6 rounded-3xl p-5 shadow-xl relative overflow-hidden text-white"
                style={{ backgroundColor: fondo }}
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <button
                            onClick={onBack}
                            aria-label="Volver"
                            className="bg-white/10 p-1.5 rounded-lg text-white hover:bg-white/20 active:scale-95 transition-all outline-none"
                        >
                            <ChevronRight size={16} className="rotate-180" />
                        </button>
                        <div className="p-1.5 rounded-lg text-white" style={{ backgroundColor: acento }}>
                            {icono}
                        </div>
                        <span
                            className="font-black uppercase tracking-widest text-[9px]"
                            style={{ color: acento }}
                        >
                            Fase {fase.orden}: {fase.nombre}
                        </span>
                    </div>

                    <h2 className="text-white text-xl font-black leading-tight mb-2">
                        {fase.nombre}
                    </h2>
                    {/* El propósito va solo: anteponerle el nombre del paciente producía
                        frases que no cerraban («ANA, devolver al metabolismo…»). */}
                    <p className="text-white/80 text-[12px] font-medium leading-relaxed max-w-[92%]">
                        {fase.proposito}
                    </p>
                </div>
            </div>

            {/* En qué consiste */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mx-4 mt-5 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100"
            >
                <span className="text-[9px] font-black uppercase tracking-widest block mb-2" style={{ color: acento }}>
                    En qué consiste
                </span>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                    {fase.descripcion}
                </p>
            </motion.div>

            {/* Modalidades */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mx-4 mt-4 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100"
            >
                <span className="text-[9px] font-black uppercase tracking-widest block mb-4" style={{ color: acento }}>
                    {fase.modalidades.length === 1 ? 'Modalidad' : 'Modalidades'}
                </span>
                <ul className="flex flex-col gap-3">
                    {fase.modalidades.map((modalidad, i) => (
                        <motion.li
                            key={modalidad}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 + i * 0.06 }}
                            className="flex items-center gap-3"
                        >
                            <span
                                className="w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black text-white shrink-0"
                                style={{ backgroundColor: acento }}
                            >
                                {i + 1}
                            </span>
                            <span className="text-[#293b64] text-sm font-bold leading-snug">
                                {modalidad}
                            </span>
                        </motion.li>
                    ))}
                </ul>
            </motion.div>

            {/* Qué sigue en la secuencia */}
            <div className="mx-4 mt-4 flex items-start gap-2.5 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                    Las 4R son una secuencia: primero se remueve, luego se revitaliza, después
                    se regenera y por último se restaura. Esta es la fase {fase.orden} de 4.
                </p>
            </div>

            <div className="mx-4 mt-4">
                <WellnessDisclaimer text={AVISO_4R} />
            </div>
        </div>
    );
};

export default Phase4RView;

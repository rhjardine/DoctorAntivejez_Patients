import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import PublicHeader from '../../components/public/PublicHeader';
import { useExitConfirmation } from '../../hooks/useExitConfirmation';
import ExitConfirmModal from '../../components/public/ExitConfirmModal';
import WellnessDisclaimer from '../../components/public/WellnessDisclaimer';
import { VITALITY_LABELS } from '../../utils/vitalityLabels';

/* ─── Question definitions ─────────────────────────────────────────────── */
type Question = {
    id: string;
    text: string;
    group: 1 | 2 | 3 | 4 | 5;
    direction: 'positive' | 'negative';
    weight: number;
};

export const QUESTIONS: Question[] = [
    // GRUPO 1 — ENERGÍA Y ESTADO MENTAL
    { id: 'R1a', text: 'Se siente frecuentemente agotado', direction: 'negative', weight: 2, group: 1 },
    { id: 'R2a', text: 'Se siente feliz la mayor parte del tiempo', direction: 'positive', weight: 1, group: 1 },
    { id: 'R3a', text: 'Cambia de humor con facilidad', direction: 'negative', weight: 1, group: 1 },
    { id: 'R4a', text: 'Se enoja fácilmente', direction: 'negative', weight: 1, group: 1 },
    { id: 'R5a', text: 'Se deprime frecuentemente', direction: 'negative', weight: 2, group: 1 },
    { id: 'R6a', text: 'Se siente ansioso o muy estresado frecuentemente', direction: 'negative', weight: 2, group: 1 },
    { id: 'R7a', text: 'Siente que tiene que esforzarse mucho para trabajar', direction: 'negative', weight: 1, group: 1 },
    { id: 'R8a', text: 'Está pensando siempre en retirarse del trabajo', direction: 'negative', weight: 1, group: 1 },
    { id: 'R9a', text: 'Se mantiene en contacto con sus amigos', direction: 'positive', weight: 1, group: 1 },
    { id: 'R10a', text: 'Mantiene interés en el sexo', direction: 'positive', weight: 1, group: 1 },
    { id: 'R11a', text: 'Su vida sexual ha declinado', direction: 'negative', weight: 2, group: 1 },
    // GRUPO 2 — SUEÑO Y COGNICIÓN
    { id: 'R12a', text: 'Problema para mantenerse despierto en el día', direction: 'negative', weight: 2, group: 2 },
    { id: 'R13a', text: 'Se siente descansado al despertar', direction: 'positive', weight: 2, group: 2 },
    { id: 'R14a', text: 'Siente que se le olvidan las cosas', direction: 'negative', weight: 2, group: 2 },
    { id: 'R15a', text: 'Siente que es difícil pensar claramente', direction: 'negative', weight: 2, group: 2 },
    { id: 'R16a', text: 'Utiliza ayuda para su memoria (ej: lista)', direction: 'negative', weight: 1, group: 2 },
    { id: 'R17a', text: 'Tiene problema de concentración', direction: 'negative', weight: 2, group: 2 },
    // GRUPO 3 — COMPOSICIÓN CORPORAL Y SALUD GENERAL
    { id: 'R18a', text: 'Se siente fuera de forma física', direction: 'negative', weight: 2, group: 3 },
    { id: 'R19a', text: 'Tiene sobrepeso u obesidad', direction: 'negative', weight: 2, group: 3 },
    { id: 'R20a', text: 'Tiene dificultades para bajar de peso', direction: 'negative', weight: 1, group: 3 },
    { id: 'R21a', text: 'Ha engordado el abdomen (cauchos)', direction: 'negative', weight: 2, group: 3 },
    { id: 'R22a', text: 'Luce su musculatura joven', direction: 'positive', weight: 2, group: 3 },
    { id: 'R23a', text: 'Siente que su salud en general es buena', direction: 'positive', weight: 2, group: 3 },
    { id: 'R24a', text: 'Se enferma o se resfría frecuentemente', direction: 'negative', weight: 1, group: 3 },
    { id: 'R25a', text: 'Siente dolores frecuentemente', direction: 'negative', weight: 2, group: 3 },
    { id: 'R26a', text: 'Su colesterol está generalmente elevado', direction: 'negative', weight: 2, group: 3 },
    { id: 'R27a', text: 'Toma pastillas para controlar el colesterol', direction: 'negative', weight: 2, group: 3 },
    { id: 'R28a', text: 'Hombres - ha perdido musculatura', direction: 'negative', weight: 2, group: 3 },
    { id: 'R29a', text: 'Mujeres - ha aumentado la grasa corporal', direction: 'negative', weight: 2, group: 3 },
    { id: 'R30a', text: 'Su presión arterial es normal', direction: 'positive', weight: 2, group: 3 },
    // GRUPO 4 — SIGNOS FÍSICOS DE ENVEJECIMIENTO
    { id: 'R31a', text: 'Se ha deteriorado su visión notablemente', direction: 'negative', weight: 1, group: 4 },
    { id: 'R32a', text: 'Tiene que orinar frecuentemente', direction: 'negative', weight: 1, group: 4 },
    { id: 'R33a', text: 'Tiene problemas digestivos', direction: 'negative', weight: 1, group: 4 },
    { id: 'R34a', text: 'La piel de su cara, cuello, brazos o abdomen es fláccida', direction: 'negative', weight: 2, group: 4 },
    { id: 'R35a', text: 'Se ve o siente más viejo(a) que sus contemporáneos', direction: 'negative', weight: 3, group: 4 },
    { id: 'R36a', text: 'Tiene celulitis en sus muslos', direction: 'negative', weight: 1, group: 4 },
    { id: 'R37a', text: 'Necesita cortarse el cabello menos frecuentemente', direction: 'negative', weight: 1, group: 4 },
    { id: 'R38a', text: 'Tardan sus heridas o magulladuras en sanar o cicatrizar', direction: 'negative', weight: 2, group: 4 },
    { id: 'R39a', text: 'Cada día se le hace más difícil ejercitarse', direction: 'negative', weight: 2, group: 4 },
    { id: 'R40a', text: 'Tiene menos resistencia que antes', direction: 'negative', weight: 2, group: 4 },
    { id: 'R41a', text: 'Se le hace difícil respirar cuando hace ejercicios fuertes', direction: 'negative', weight: 2, group: 4 },
    { id: 'R42a', text: 'Está en mejores condiciones que nunca', direction: 'positive', weight: 3, group: 4 },
    // GRUPO 5 — RANGO DE EDAD
    { id: 'R43a', text: 'Tiene entre 55 y 64 años', direction: 'negative', weight: 3, group: 5 },
    { id: 'R44a', text: 'Tiene entre 65 y 74 años', direction: 'negative', weight: 5, group: 5 },
    { id: 'R45a', text: 'Tiene más de 75 años', direction: 'negative', weight: 7, group: 5 },
];

const GROUP_NAMES: Record<number, string> = {
    1: 'Energía y Estado Mental',
    2: 'Sueño y Cognición',
    3: 'Composición Corporal',
    4: 'Signos de Envejecimiento',
    5: 'Rango de Edad',
};

/* ─── Score calculation ─────────────────────────────────────────────────── */
export function calcularScore(answers: Record<string, boolean>) {
    const maxPossibleNegative = QUESTIONS
        .filter(q => q.direction === 'negative')
        .reduce((acc, q) => acc + q.weight, 0);
    const maxPossiblePositive = QUESTIONS
        .filter(q => q.direction === 'positive')
        .reduce((acc, q) => acc + q.weight, 0);

    let positiveSum = 0;
    let negativeSum = 0;

    QUESTIONS.forEach(q => {
        const answered = answers[q.id] === true;
        if (q.direction === 'positive' && answered) positiveSum += q.weight;
        if (q.direction === 'negative' && answered) negativeSum += q.weight;
    });

    const negativeNotMarked = maxPossibleNegative - negativeSum;
    const rawPoints = negativeNotMarked + positiveSum;
    const maxPoints = maxPossibleNegative + maxPossiblePositive;
    const score = Math.round((rawPoints / maxPoints) * 100);

    type Category = 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'CRITICO';
    const category: Category = score >= 80 ? 'EXCELENTE'
        : score >= 60 ? 'BUENO'
            : score >= 40 ? 'REGULAR' : 'CRITICO';

    const chronoAge = answers['R45a'] ? 78
        : answers['R44a'] ? 69
            : answers['R43a'] ? 59 : 45;
    const ageMultiplier = 1 + ((100 - score) / 100) * 0.3;
    const yearsBiological = Math.round(chronoAge * ageMultiplier);

    // Per-group scoring
    const dimensiones: Record<string, number> = {};
    for (let g = 1; g <= 5; g++) {
        const groupQs = QUESTIONS.filter(q => q.group === g);
        const gMaxNeg = groupQs.filter(q => q.direction === 'negative').reduce((a, q) => a + q.weight, 0);
        const gMaxPos = groupQs.filter(q => q.direction === 'positive').reduce((a, q) => a + q.weight, 0);
        const gMaxTotal = gMaxNeg + gMaxPos;
        let gPos = 0, gNeg = 0;
        groupQs.forEach(q => {
            const answered = answers[q.id] === true;
            if (q.direction === 'positive' && answered) gPos += q.weight;
            if (q.direction === 'negative' && answered) gNeg += q.weight;
        });
        const gRaw = (gMaxNeg - gNeg) + gPos;
        dimensiones[`grupo${g}`] = gMaxTotal > 0 ? Math.round((gRaw / gMaxTotal) * 100) : 100;
    }

    return { score, rawPoints, category, yearsBiological, gapText: '', dimensiones };
}

const TestAntivejezPage: React.FC = () => {
    const navigate = useNavigate();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [answers, setAnswers] = useState<Record<string, boolean>>({});
    const [currentGroup, setCurrentGroup] = useState<1 | 2 | 3 | 4 | 5>(1);

    const totalAnswered = Object.keys(answers).length;
    const hasProgress = totalAnswered > 0;

    // 👇 FIX APLICADO AQUÍ: exitTo ahora apunta directo a '/longevidad'
    const { handleBack, showConfirm, confirmExit, cancelExit } = useExitConfirmation({
        hasProgress,
        exitTo: '/longevidad', // Antes decía: '/longevidad-tests'
        message: `Has respondido ${totalAnswered} de 45 preguntas. ¿Seguro que quieres salir?`
    });

    // ── FIX 1: Scroll to top on mount ──────────────────────────────────
    useEffect(() => {
        const scrollToTop = () => {
            scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
            window.scrollTo({ top: 0, behavior: 'instant' });
            document.getElementById('vytalix-main-container')?.scrollTo({ top: 0, behavior: 'instant' });
        };
        scrollToTop();
        // Fallback for slower mobile renders
        setTimeout(scrollToTop, 100);
    }, []);

    const groupQuestions = QUESTIONS.filter(q => q.group === currentGroup);
    const allAnswered = groupQuestions.every(q => q.id in answers);

    const answer = (id: string, val: boolean) => {
        setAnswers(prev => ({ ...prev, [id]: val }));
    };

    const next = () => {
        if (currentGroup < 5) {
            setCurrentGroup(prev => (prev + 1) as 1 | 2 | 3 | 4 | 5);
            // ── FIX 2: Scroll properly after group change (with delay) ──
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
                const mainContainer = document.getElementById('vytalix-main-container');
                if (mainContainer) {
                    mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 50);
        } else {
            // Guarda y avanza al resultado (Stage 2)
            const resultado = calcularScore(answers);
            sessionStorage.setItem('vx_test_result', JSON.stringify(resultado));
            navigate('/resultado');
        }
    };

    // Question numbers per group
    const questionOffset = QUESTIONS.filter(q => q.group < currentGroup).length;

    return (
        <div className="min-h-screen flex flex-col relative bg-[#f8fafc]">
            <PublicHeader
                theme="wellness"
                showBack={true}
                onBack={handleBack}
                progress={Math.round((Object.keys(answers).length / 45) * 100)}
                progressLabel={`${Object.keys(answers).length}/45 respondidas · Grupo ${currentGroup} de 5`}
            />

            {/* Questions */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-5 py-6"
                style={{ paddingBottom: '280px' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentGroup}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-4"
                    >
                        {groupQuestions.map((q, idx) => {
                            const qNumber = questionOffset + idx + 1;
                            const val = answers[q.id];
                            return (
                                <div key={q.id} className="p-6 bg-white rounded-[1.5rem] border border-[#293b64]/5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-[#107da8]">
                                        ANÁLISIS VITAL {qNumber}
                                    </p>
                                    <p className="text-[17px] font-semibold mb-8 leading-tight text-[#293b64] tracking-tight">
                                        {q.text}
                                    </p>
                                    <div className="flex gap-3">
                                        {/* Botón SÍ */}
                                        <button
                                            onClick={() => answer(q.id, true)}
                                            className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all duration-200 active:scale-95 ${val === true
                                                ? 'bg-[#23bcef] text-white shadow-lg shadow-[#23bcef]/30'
                                                : 'bg-[#f8fafc] text-[#293b64]/40 border border-[#293b64]/10'
                                                }`}
                                        >
                                            SÍ
                                        </button>

                                        {/* Botón NO */}
                                        <button
                                            onClick={() => answer(q.id, false)}
                                            className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all duration-200 active:scale-95 ${val === false
                                                ? 'bg-[#293b64] text-[#f8fafc] shadow-lg shadow-[#293b64]/30'
                                                : 'bg-[#f8fafc] text-[#293b64]/40 border border-[#293b64]/10'
                                                }`}
                                        >
                                            NO
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Sticky footer */}
            <div className="fixed bottom-0 left-0 right-0 px-6 py-5 z-20 bg-[#f8fafc]/90 backdrop-blur-md border-t border-[#293b64]/5"
                style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
                {/* Disclaimer */}
                <div className="mb-6">
                    <WellnessDisclaimer text="Esta evaluación de biomarcadores y hábitos es orientativa. No constituye un diagnóstico médico formal." />
                </div>
                <button
                    onClick={next}
                    disabled={!allAnswered}
                    className="w-full py-5 bg-[#23bcef] text-white font-black text-[15px] flex items-center justify-center gap-2 rounded-full shadow-xl shadow-[#23bcef]/20 transform active:scale-95 transition-all uppercase tracking-[0.15em] disabled:opacity-40 disabled:scale-100"
                >
                    {currentGroup < 5 ? (
                        <>Siguiente bloque <ChevronRight size={18} strokeWidth={3} /></>
                    ) : (
                        <>Consultar Vitalidad <ChevronRight size={18} strokeWidth={3} /></>
                    )}
                </button>
                <p className="text-center text-[9px] mt-4 font-black uppercase tracking-[0.3em] text-[#293b64]/30">
                    SISTEMA BIOMÉTRICO VYTALIX
                </p>
            </div>

            <ExitConfirmModal
                isOpen={showConfirm}
                onConfirm={confirmExit}
                onCancel={cancelExit}
                message={`Has respondido ${Object.keys(answers).length} de 45 preguntas. ¿Seguro que quieres salir?`}
            />
        </div>
    );
};

export default TestAntivejezPage;
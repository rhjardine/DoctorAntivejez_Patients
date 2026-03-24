import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import PublicHeader from '../../components/public/PublicHeader';
import { useExitConfirmation } from '../../hooks/useExitConfirmation';
import ExitConfirmModal from '../../components/public/ExitConfirmModal';
import { WELLNESS } from '../../styles/wellnessPalette';
import { VITALITY_LABELS } from '../../utils/vitalityLabels';

/* ─── Question definitions ─────────────────────────────────────────────── */
type Question = {
    id: string;
    text: string;
    group: 1 | 2 | 3 | 4 | 5;
    direction: 'positive' | 'negative';
    weight: number;
};

const QUESTIONS: Question[] = [
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
function calcularScore(answers: Record<string, boolean>) {
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

/* ─── Component ─────────────────────────────────────────────────────────── */
const TestAntivejezPage: React.FC = () => {
    const navigate = useNavigate();
    const [answers, setAnswers] = useState<Record<string, boolean>>({});
    const [currentGroup, setCurrentGroup] = useState<1 | 2 | 3 | 4 | 5>(1);

    const totalAnswered = Object.keys(answers).length;
    const hasProgress = totalAnswered > 0;
    const { handleBack, showConfirm, confirmExit, cancelExit } = useExitConfirmation({
        hasProgress,
        exitTo: '/longevidad-tests',
        message: `Has respondido ${totalAnswered} de 45 preguntas. ¿Seguro que quieres salir?`
    });

    const groupQuestions = QUESTIONS.filter(q => q.group === currentGroup);
    const allAnswered = groupQuestions.every(q => q.id in answers);
    // const progress = (currentGroup - 1) / 5; // This is no longer needed as PublicHeader handles progress

    const answer = (id: string, val: boolean) => {
        setAnswers(prev => ({ ...prev, [id]: val }));
    };

    const next = () => {
        if (currentGroup < 5) {
            setCurrentGroup(prev => (prev + 1) as 1 | 2 | 3 | 4 | 5);
            // ✅ ENHANCEMENT: Scroll correctly targeting main container
            const mainContainer = document.getElementById('vytalix-main-container');
            if (mainContainer) {
                mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
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
        <div className="min-h-screen flex flex-col relative" style={{ background: WELLNESS.bg }}>
            <PublicHeader
                theme="wellness"
                showBack={true}
                onBack={handleBack}
                progress={Math.round((Object.keys(answers).length / 45) * 100)}
                progressLabel={`${Object.keys(answers).length}/45 respondidas · Grupo ${currentGroup} de 5`}
            />

            {/* Questions */}
            <div className="flex-1 overflow-y-auto px-5 py-4 pb-36">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentGroup}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-3"
                    >
                        {groupQuestions.map((q, idx) => {
                            const qNumber = questionOffset + idx + 1;
                            const val = answers[q.id];
                            return (
                                <div key={q.id} className="p-5"
                                    style={{
                                        background: WELLNESS.bgCard,
                                        border: `1px solid ${WELLNESS.earth}26`, // 0.15 alpha
                                        borderRadius: 16,
                                        boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
                                    }}>
                                    <p className="text-[12px] font-black uppercase mb-2" style={{ color: WELLNESS.sage, letterSpacing: '0.1em' }}>
                                        PREGUNTA {qNumber}
                                    </p>
                                    <p className="text-[16px] font-medium mb-6 leading-snug" style={{ color: '#5C4A32' }}>
                                        {q.text}
                                    </p>
                                    <div className="flex gap-2.5">
                                        {/* Botón SÍ */}
                                        <button
                                            onClick={() => answer(q.id, true)}
                                            style={{
                                                flex: 1,
                                                padding: '13px 0',
                                                borderRadius: 16,
                                                fontSize: val === true ? 16 : 14,
                                                fontWeight: val === true ? 800 : 500,
                                                fontFamily: 'Poppins, sans-serif',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                transform: val === true ? 'scale(1.02)' : 'scale(1)',
                                                ...(val === true ? {
                                                    background: '#7C9A7E',
                                                    color: 'white',
                                                    border: 'none',
                                                    boxShadow: '0 2px 8px rgba(124,154,126,0.4)',
                                                } : {
                                                    background: 'transparent',
                                                    color: '#A89880',
                                                    border: '1px solid rgba(139,115,85,0.25)',
                                                    boxShadow: 'none',
                                                })
                                            }}
                                        >
                                            SÍ
                                        </button>

                                        {/* Botón NO */}
                                        <button
                                            onClick={() => answer(q.id, false)}
                                            style={{
                                                flex: 1,
                                                padding: '13px 0',
                                                borderRadius: 16,
                                                fontSize: val === false ? 16 : 14,
                                                fontWeight: val === false ? 800 : 500,
                                                fontFamily: 'Poppins, sans-serif',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                transform: val === false ? 'scale(1.02)' : 'scale(1)',
                                                ...(val === false ? {
                                                    background: '#5C4A32',
                                                    color: '#FDFAF4',
                                                    border: 'none',
                                                    boxShadow: '0 2px 8px rgba(92,74,50,0.25)',
                                                } : {
                                                    background: 'transparent',
                                                    color: '#A89880',
                                                    border: '1px solid rgba(139,115,85,0.25)',
                                                    boxShadow: 'none',
                                                })
                                            }}
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
            <div className="fixed bottom-0 left-0 right-0 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
                style={{ background: WELLNESS.bgDeep, borderTop: `1px solid ${WELLNESS.earth}26` }}>
                {/* Disclaimer */}
                <p className="text-center text-[10px] mb-3 leading-relaxed px-2 italic"
                    style={{ color: WELLNESS.textHint }}>
                    Esta evaluación es orientativa. No constituye diagnóstico médico.
                </p>
                <button
                    onClick={next}
                    disabled={!allAnswered}
                    className="w-full font-bold text-[15px] flex items-center justify-center gap-2 transition-all"
                    style={{
                        background: WELLNESS.terracotta, color: WELLNESS.bgCard, borderRadius: 28,
                        padding: '15px 0', fontFamily: 'Poppins, sans-serif',
                        opacity: allAnswered ? 1 : 0.4,
                        transform: allAnswered ? 'scale(1)' : 'scale(0.98)'
                    }}
                >
                    {currentGroup < 5 ? (
                        <>Siguiente grupo <ChevronRight size={18} /></>
                    ) : (
                        <>Ver mis Resultados <ChevronRight size={18} /></>
                    )}
                </button>
                <p className="text-center text-[10px] mt-2 font-black uppercase tracking-[0.2em] opacity-40" style={{ color: WELLNESS.textSecond }}>
                    Creado por Vytalix.io
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

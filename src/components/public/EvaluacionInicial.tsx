// Componente de Evaluación Inicial - Vytalix Premium
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Dna, ScanFace, Watch, HeartPulse, ChevronRight, Activity } from 'lucide-react';

export interface BrandingInfo {
    appName?: string;
}

export interface EvaluacionInicialProps {
    branding?: BrandingInfo;
}

export const EvaluacionInicial: React.FC<EvaluacionInicialProps> = ({ branding }) => {
    const appName = branding?.appName || 'Evaluación Médica';

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    };

    const diagnosticSteps = [
        {
            id: 'edad-celular',
            title: 'Test de Edad Celular',
            description: 'Cuestionario clínico validado',
            icon: Dna,
        },
        {
            id: 'vitalidad-visual',
            title: 'Análisis Visual de Vitalidad',
            description: 'Escaneo facial con IA',
            icon: ScanFace,
        },
        {
            id: 'sync-wearables',
            title: 'Sincronización de Wearables',
            description: 'Apple Watch / Oura',
            icon: Watch,
            badge: 'Recomendado'
        },
        {
            id: 'auditoria-estres',
            title: 'Auditoría de Resiliencia y Estrés',
            description: 'Evaluación metabólica',
            icon: HeartPulse,
        }
    ];

    return (
        <div className="min-h-screen bg-[#F9F6F0] text-[#3B3631] font-sans flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
            {/* Header section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-2xl text-center mb-10"
            >
                <div className="inline-flex items-center justify-center p-3 bg-white/60 rounded-full mb-4 shadow-sm">
                    <Activity className="w-6 h-6 text-[#B35446]" />
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#3B3631] mb-2">
                    Su Hub de Diagnóstico
                </h1>
                <p className="text-[#3B3631]/70 text-lg max-w-lg mx-auto">
                    Complete su perfil biológico de precisión con {appName}.
                </p>
            </motion.div>

            {/* Cards container */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="w-full max-w-2xl space-y-4"
            >
                {diagnosticSteps.map((step) => (
                    <motion.button
                        key={step.id}
                        variants={itemVariants}
                        whileTap={{ scale: 0.95 }}
                        className="w-full text-left group bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-sm transition-all hover:bg-white/90 hover:shadow-md flex items-center justify-between border border-transparent hover:border-[#B35446]/20 focus:outline-none focus:ring-2 focus:ring-[#B35446] focus:border-transparent min-h-[5rem]"
                    >
                        <div className="flex items-center space-x-5">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#F9F6F0] text-[#B35446] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                                <step.icon className="w-6 h-6" />
                            </div>

                            <div className="flex flex-col justify-center">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-medium text-[#3B3631] leading-tight">
                                        {step.title}
                                    </h3>
                                    {step.badge && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#B35446]/10 text-[#B35446]">
                                            {step.badge}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-[#3B3631]/70 mt-1 align-middle line-clamp-2">
                                    {step.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex-shrink-0 text-[#B35446]/40 group-hover:text-[#B35446] transition-colors">
                            <ChevronRight className="w-6 h-6" />
                        </div>
                    </motion.button>
                ))}
            </motion.div>

            {/* Footer section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-auto pt-12 pb-6 text-center"
            >
                <p className="text-xs font-medium text-[#3B3631]/40 uppercase tracking-wider">
                    Powered by VYTALIX
                </p>
            </motion.div>

        </div>
    );
};

export default EvaluacionInicial;

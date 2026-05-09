import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, BrainCircuit, Activity, LineChart, ShieldCheck } from 'lucide-react';

const LandingPublicaPage: React.FC = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-[#FAF7F2] pb-24 font-sans relative overflow-hidden">

            {/* Botón Volver */}
            <div className="pt-6 px-6 relative z-20">
                <button
                    onClick={() => navigate('/acceso')}
                    className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-[#E8DFD5] text-[#8A796F] hover:text-[#9E5B4B] transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
            </div>

            <motion.div
                className="px-4 md:px-6 pt-6 max-w-2xl mx-auto space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >

                {/* HERO SECTION (Gradiente Terracota) */}
                <motion.div variants={itemVariants} className="relative overflow-hidden bg-gradient-to-br from-[#7D4638] to-[#5A382D] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-[#7D4638]/20 text-center">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Activity className="w-48 h-48" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 mb-6">
                            <ShieldCheck className="w-8 h-8 text-[#E8C5B8]" />
                        </div>
                        <h2 className="text-3xl font-black text-white leading-tight mb-3">
                            Descubre tu<br /><span className="text-[#E8C5B8]">Edad Biológica</span>
                        </h2>
                        <p className="text-sm font-medium text-[#D6B5A7] leading-relaxed max-w-xs mx-auto">
                            La ciencia de la longevidad a tu alcance. Evalúa tus biomarcadores y descubre cómo revertir tu reloj celular.
                        </p>
                    </div>
                </motion.div>

                {/* OPCIONES DE EVALUACIÓN DIRECTAS */}
                <motion.div variants={itemVariants} className="pt-4">
                    <h3 className="text-sm font-black text-[#4A3B32] uppercase tracking-widest px-2 mb-4">
                        Herramientas Diagnósticas
                    </h3>

                    <div className="grid gap-4">
                        {/* Opción 1: Test Directo (Adiós pantalla redundante) */}
                        <button
                            onClick={() => navigate('/test')}
                            className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-md shadow-[#D6B5A7]/20 border border-[#E8DFD5] flex flex-col items-start gap-4 transition-transform active:scale-[0.98] hover:border-[#D6B5A7] relative overflow-hidden group"
                        >
                            <div className="absolute right-0 top-0 h-full w-2 bg-[#9E5B4B] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center gap-4 w-full">
                                <div className="w-14 h-14 bg-[#F4EBE6] rounded-2xl flex items-center justify-center shrink-0">
                                    <LineChart className="w-7 h-7 text-[#9E5B4B]" />
                                </div>
                                <div className="flex-1 text-left">
                                    <h4 className="text-lg font-black text-[#4A3B32] leading-none mb-1">Cuestionario Clínico</h4>
                                    <p className="text-xs font-medium text-[#8A796F]">Test integral de hábitos y estilo de vida</p>
                                </div>
                            </div>
                        </button>

                        {/* Opción 2: AgeBot IA */}
                        <button
                            onClick={() => navigate('/agebot')}
                            className="w-full bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-md shadow-[#D6B5A7]/20 border border-[#E8DFD5] flex flex-col items-start gap-4 transition-transform active:scale-[0.98] hover:border-[#C4B2AA] relative overflow-hidden group"
                        >
                            <div className="absolute right-0 top-0 h-full w-2 bg-[#826659] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex items-center gap-4 w-full">
                                <div className="w-14 h-14 bg-[#EFE8E2] rounded-2xl flex items-center justify-center shrink-0">
                                    <BrainCircuit className="w-7 h-7 text-[#826659]" />
                                </div>
                                <div className="flex-1 text-left">
                                    <h4 className="text-lg font-black text-[#4A3B32] leading-none mb-1">Análisis Facial IA</h4>
                                    <p className="text-xs font-medium text-[#8A796F]">Evaluación fotográfica por inteligencia artificial</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </motion.div>

                {/* Enlace Médico */}
                <motion.div variants={itemVariants} className="pt-8 text-center">
                    <p className="text-sm text-[#8A796F] font-medium">
                        ¿Ya tienes tus resultados?{' '}
                        <button onClick={() => navigate('/medicos')} className="text-[#9E5B4B] font-bold hover:underline">
                            Contacta a un especialista
                        </button>
                    </p>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default LandingPublicaPage;
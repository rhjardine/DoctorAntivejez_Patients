import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ShieldPlus, Stethoscope, ChevronRight, Activity } from 'lucide-react';

const UniversalEntry: React.FC = () => {
    const navigate = useNavigate();

    // Variantes de animación para Framer Motion
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">

            {/* Elementos Decorativos de Fondo */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-slate-100 to-transparent pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-200 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

            <motion.div
                className="w-full max-w-sm z-10 space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Logo / Header */}
                <motion.div variants={itemVariants} className="text-center space-y-3 mb-10">
                    <div className="w-20 h-20 bg-white/80 backdrop-blur-md rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center mx-auto border border-slate-100">
                        <Activity className="w-10 h-10 text-[#14b8a6]" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-2xl font-black text-[#293b64] tracking-tight uppercase">
                        Dr. Antivejez
                    </h1>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
                        Portal de Longevidad
                    </p>
                </motion.div>

                {/* Opciones Equilibradas */}
                <div className="space-y-4">

                    {/* Tarjeta 1: Soy Paciente */}
                    <motion.button
                        variants={itemVariants}
                        onClick={() => navigate('/login')}
                        className="w-full group relative bg-gradient-to-r from-[#14b8a6] to-[#0d9488] rounded-3xl p-5 shadow-xl shadow-[#14b8a6]/20 flex items-center gap-5 overflow-hidden transition-transform active:scale-[0.98]"
                    >
                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-white/5 skew-x-12 translate-x-16 group-hover:translate-x-8 transition-transform"></div>
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/10">
                            <User className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="text-lg font-black text-white leading-none mb-1">Soy Paciente</h3>
                            <p className="text-xs font-medium text-white/80">Acceder a mi protocolo médico</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                    </motion.button>

                    {/* Tarjeta 2: Soy Invitado */}
                    <motion.button
                        variants={itemVariants}
                        onClick={() => navigate('/longevidad')}
                        className="w-full group bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-md shadow-slate-200 border border-slate-100 flex items-center gap-5 transition-all active:scale-[0.98] hover:border-[#14b8a6]"
                    >
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                            <ShieldPlus className="w-7 h-7 text-[#14b8a6]" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="text-lg font-black text-[#293b64] leading-none mb-1">Soy Invitado</h3>
                            <p className="text-xs font-medium text-slate-500">Calcula tu Edad Biológica</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-[#14b8a6] transition-colors" />
                    </motion.button>

                    {/* Tarjeta 3: Soy Médico */}
                    <motion.button
                        variants={itemVariants}
                        onClick={() => navigate('/login?role=medical')}
                        className="w-full group bg-white/90 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center gap-5 transition-all active:scale-[0.98] hover:border-[#293b64]"
                    >
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                            <Stethoscope className="w-7 h-7 text-[#293b64]" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="text-lg font-black text-[#293b64] leading-none mb-1">Soy Médico</h3>
                            <p className="text-xs font-medium text-slate-500">Portal de especialistas</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-[#293b64] transition-colors" />
                    </motion.button>

                </div>

                {/* Footer Seguro */}
                <motion.div variants={itemVariants} className="pt-8 text-center opacity-60">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Vytalix Clinical Platform © {new Date().getFullYear()}
                    </p>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default UniversalEntry;
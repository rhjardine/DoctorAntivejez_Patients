import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ShieldPlus, Stethoscope, ChevronRight } from 'lucide-react';

const DnaBackground: React.FC = () => {
    // 6 lightweight DNA particles drifting via framer-motion
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute opacity-10 text-slate-300"
                    initial={{ 
                        left: `${Math.random() * 100}%`, 
                        top: `${Math.random() * 100}%`,
                        rotate: Math.random() * 360,
                        scale: 0.8 + Math.random() * 1.5
                    }}
                    animate={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        rotate: Math.random() * 360 + 180,
                    }}
                    transition={{
                        duration: 40 + Math.random() * 40,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "linear"
                    }}
                >
                    <svg width="40" height="80" viewBox="0 0 40 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M 10 10 C 30 30, 30 50, 10 70 M 30 10 C 10 30, 10 50, 30 70 M 13 22 L 27 22 M 17 38 L 23 38 M 17 42 L 23 42 M 13 58 L 27 58"/>
                    </svg>
                </motion.div>
            ))}
        </div>
    );
};

const UniversalEntry: React.FC = () => {
    const navigate = useNavigate();

    const containerVariants: any = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            
            <DnaBackground />

            <motion.div
                className="w-full max-w-sm z-10 space-y-8"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {/* Official Logo */}
                <motion.div variants={itemVariants} className="text-center mb-10">
                    <img 
                        src="/Logo_azul_oscuro.png" 
                        alt="Doctor Antivejez" 
                        className="w-40 md:w-48 mx-auto object-contain drop-shadow-sm"
                    />
                </motion.div>

                {/* Main Glassmorphism Container */}
                <motion.div 
                    variants={itemVariants}
                    className="p-8 bg-white/70 backdrop-blur-xl border border-white/20 shadow-[0_15px_60px_rgba(41,59,100,0.06)] rounded-[2.5rem]"
                >
                    <div className="space-y-4">

                        {/* Button 1: Soy Paciente */}
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full group bg-[#14b8a6] rounded-3xl p-5 shadow-sm flex items-center gap-5 transition-all active:scale-[0.98] border-4 border-transparent hover:border-[#293b64] focus:border-[#293b64] focus:outline-none"
                        >
                            <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/10">
                                <User className="w-7 h-7 text-[#f2e2cf]" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-lg font-black text-[#293b64] leading-none mb-1">Soy Paciente</h3>
                                <p className="text-xs font-bold text-[#293b64]/70">Acceder a mi protocolo</p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-[#293b64]/50 group-hover:text-[#293b64] transition-colors" />
                        </button>

                        {/* Button 2: Soy Invitado */}
                        <button
                            onClick={() => navigate('/longevidad')}
                            className="w-full group bg-[#14b8a6] rounded-3xl p-5 shadow-sm flex items-center gap-5 transition-all active:scale-[0.98] border-4 border-transparent hover:border-[#293b64] focus:border-[#293b64] focus:outline-none"
                        >
                            <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/10">
                                <ShieldPlus className="w-7 h-7 text-[#f2e2cf]" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-lg font-black text-[#293b64] leading-none mb-1">Soy Invitado</h3>
                                <p className="text-xs font-bold text-[#293b64]/70">Calcula tu Edad Biológica</p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-[#293b64]/50 group-hover:text-[#293b64] transition-colors" />
                        </button>

                        {/* Button 3: Soy Médico */}
                        <button
                            onClick={() => navigate('/login?role=medical')}
                            className="w-full group bg-[#14b8a6] rounded-3xl p-5 shadow-sm flex items-center gap-5 transition-all active:scale-[0.98] border-4 border-transparent hover:border-[#293b64] focus:border-[#293b64] focus:outline-none"
                        >
                            <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/10">
                                <Stethoscope className="w-7 h-7 text-[#f2e2cf]" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-lg font-black text-[#293b64] leading-none mb-1">Soy Médico</h3>
                                <p className="text-xs font-bold text-[#293b64]/70">Portal de especialistas</p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-[#293b64]/50 group-hover:text-[#293b64] transition-colors" />
                        </button>

                    </div>
                </motion.div>

                {/* Footer Seguro */}
                <motion.div variants={itemVariants} className="pt-8 text-center opacity-60">
                    <p className="text-[10px] font-bold text-[#293b64] uppercase tracking-widest">
                        Doctor Antivejez © {new Date().getFullYear()}
                    </p>
                </motion.div>

            </motion.div>
        </div>
    );
};

export default UniversalEntry;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, UserRound, ArrowRight } from 'lucide-react';

/**
 * UserProfileGatewayPage (H29 - Progressive Routing)
 * 
 * Establishes a strict visual hierarchy to reduce decision fatigue:
 * 1. Primary: Soy Paciente (Solid Navy)
 * 2. Secondary: Soy Invitado (Outlined)
 * 3. Tertiary: Soy Profesional (Ghost Link)
 */

const BG = '#F8FAFC'; // Titanium White/Gray
const DARK_BLUE = '#1A3A5C'; // Vytalix Dark Blue
const TURQUOISE = '#23BCEF'; // Vytalix Turquoise
const TEXT_DARK = '#0F172A'; // Slate-900
const TEXT_GRAY = '#64748B'; // Slate-500

const UserProfileGatewayPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6 py-12"
      style={{
        background: BG,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="w-full max-w-md">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.25em] mb-4 text-[#94A3B8]">
            Doctor Antivejez
          </p>
          <h1 className="text-[32px] font-black leading-[1.1] text-slate-900 tracking-tight">
            ¿Cómo deseas ingresar?
          </h1>
          <p className="text-[15px] mt-4 text-slate-500 font-medium">
            Selecciona tu perfil para una atención personalizada.
          </p>
        </motion.div>

        {/* Action Stack */}
        <div className="flex flex-col gap-4">

          {/* PRIMARY: SOY PACIENTE */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.01, boxShadow: '0 20px 25px -5px rgba(26, 58, 92, 0.2)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="w-full text-left rounded-[2rem] p-7 transition-all flex flex-col relative overflow-hidden group"
            style={{
              background: DARK_BLUE,
              boxShadow: '0 10px 15px -3px rgba(26, 58, 92, 0.15)',
            }}
          >
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-colors" />

            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                <Stethoscope size={24} strokeWidth={2.5} />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                <ArrowRight size={18} strokeWidth={3} />
              </div>
            </div>

            <h2 className="text-[22px] font-black text-white leading-tight mb-2">Soy paciente</h2>
            <p className="text-[14px] text-white/70 leading-relaxed font-medium">
              Accede a tu guía médica personalizada y seguimiento de vitalidad.
            </p>
          </motion.button>

          {/* SECONDARY: SOY INVITADO */}
          <motion.button
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -2, background: 'rgba(255,255,255,1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/longevidad')}
            className="w-full text-left rounded-[2rem] p-6 border-2 border-slate-200 transition-all flex items-center gap-5 hover:border-slate-300"
            style={{ background: 'rgba(255,255,255,0.5)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <UserRound size={20} />
            </div>
            <div className="flex-1">
              <h2 className="text-[17px] font-bold text-slate-800">Soy invitado</h2>
              <p className="text-[12px] text-slate-500 font-medium">Explora el test de longevidad gratuito.</p>
            </div>
            <ArrowRight size={16} className="text-slate-300" />
          </motion.button>

          {/* TERTIARY: SOY PROFESIONAL */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/medicos')}
            className="mt-6 py-4 px-6 text-[13px] font-bold uppercase tracking-widest text-[#94A3B8] hover:text-slate-600 transition-colors text-center"
          >
            ¿Eres profesional de salud? <span className="text-turquoise underline ml-1" style={{ color: TURQUOISE }}>Ver red médica</span>
          </motion.button>

        </div>

        {/* Footer info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-[10px] font-black uppercase tracking-[0.2em] mt-12 text-[#CBD5E1]"
        >
          Medicina de longevidad basada en evidencia
        </motion.p>

      </div>
    </div>
  );
};

export default UserProfileGatewayPage;

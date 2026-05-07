import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen w-full bg-vytalix-sand px-8 pt-safe-top pb-safe-bottom items-center justify-between overflow-hidden relative">
      {/* Background elements for premium feel */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-vytalix-sage/5 blur-3xl -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-vytalix-terracotta/5 blur-3xl -ml-32 -mb-32" />

      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-[420px] z-10">
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <span className="font-extrabold tracking-[0.5em] text-[24px] text-vytalix-graphite block">
            VYTALIX
          </span>
          <span className="text-[10px] font-black tracking-[0.3em] text-vytalix-sage uppercase mt-3 block">
            Precision Longevity Suite
          </span>
        </motion.div>

        {/* Main Value Prop */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-20 space-y-5"
        >
          <h1 className="text-5xl font-black leading-[1.1] tracking-tighter text-vytalix-graphite">
            Tu vitalidad,
            <br />
            <span className="text-vytalix-terracotta">en tus manos.</span>
          </h1>
          <p className="text-lg font-medium text-vytalix-graphite/40 leading-relaxed max-w-[280px] mx-auto">
            Protocolos de bio-optimización basados en ciencia de vanguardia.
          </p>
        </motion.div>

        {/* Primary Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full px-4 mb-2"
        >
          <button
            onClick={() => navigate('/longevidad')}
            className="w-full bg-vytalix-terracotta text-white py-5 rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-xl shadow-vytalix-terracotta/20 transition-all active:scale-95 hover:brightness-110"
          >
            Comenzar ahora
          </button>
        </motion.div>
      </div>

      {/* Subtle Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="pb-12 text-center w-full z-10"
      >
        <div className="mb-6">
          <span className="text-xs font-medium text-vytalix-graphite/40">
            ¿Ya formas parte?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-vytalix-graphite font-black underline decoration-vytalix-terracotta/30 underline-offset-4"
            >
              Ingresar
            </button>
          </span>
        </div>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-vytalix-graphite/10" />
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-vytalix-graphite/20">
            vytalix.io
          </p>
          <div className="h-px w-8 bg-vytalix-graphite/10" />
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;


import React from 'react';
import { ShieldCheck, Heart, Award, ChevronRight, Dna, Info } from 'lucide-react';

interface AboutViewProps {
  onNavigateToTeam: () => void;
  onNavigateToGuide: () => void;
}

const AboutView: React.FC<AboutViewProps> = ({ onNavigateToTeam, onNavigateToGuide }) => {
  return (
    <div className="flex flex-col pb-24 px-4 pt-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* App Logo Area - Branded as Doctor Antivejez */}
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative mb-5 group">
           <div className="w-20 h-20 bg-darkBlue rounded-3xl shadow-xl flex items-center justify-center text-white transform group-hover:rotate-12 transition-transform duration-500">
             <Dna size={44} strokeWidth={2.5} className="text-primary" />
           </div>
           <div className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-lg shadow-lg">
             <ShieldCheck size={16} />
           </div>
        </div>
        <div className="text-center">
           <h2 className="text-xl font-black text-darkBlue tracking-tighter uppercase leading-none">Doctor</h2>
           <h2 className="text-3xl font-black text-primary tracking-tighter uppercase leading-none -mt-1">Antivejez</h2>
           <p className="text-[10px] text-textMedium font-black tracking-[0.2em] mt-2 uppercase">Medicina Antienvejecimiento & Longevidad</p>
        </div>
        <span className="mt-4 px-4 py-1 bg-slate-100 text-slate-500 text-[10px] font-black tracking-widest rounded-full uppercase">
          v1.0.0 (BETA)
        </span>
      </div>

      {/* Mission Statement */}
      <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-50">
        <h3 className="text-lg font-black text-darkBlue uppercase tracking-tighter mb-4 flex items-center gap-2">
           <div className="w-1.5 h-4 bg-primary rounded-full"></div>
           Nuestra Misión
        </h3>
        <p className="text-sm text-textMedium font-medium leading-relaxed italic">
          Empoderar a las personas para extender su salud y vitalidad a través de la ciencia, la tecnología y hábitos personalizados que reducen la edad biológica.
        </p>
      </div>

      {/* Navigation Options */}
      <div className="space-y-3">
        <button 
          onClick={onNavigateToTeam}
          className="w-full bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between active:scale-[0.98] transition-all border border-transparent hover:border-primary/20"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 shadow-inner">
                    <Heart size={24} />
                </div>
                <div className="text-left">
                    <h4 className="text-base font-black text-darkBlue uppercase tracking-tight">Equipo Médico</h4>
                    <p className="text-[10px] text-textMedium font-bold">Conoce a los especialistas</p>
                </div>
            </div>
            <ChevronRight size={20} className="text-slate-300" />
        </button>

        <button className="w-full bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between active:scale-[0.98] transition-all border border-transparent hover:border-primary/20">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 shadow-inner">
                    <Award size={24} />
                </div>
                <div className="text-left">
                    <h4 className="text-base font-black text-darkBlue uppercase tracking-tight">Certificaciones</h4>
                    <p className="text-[10px] text-textMedium font-bold">Estándares de calidad y privacidad</p>
                </div>
            </div>
            <ChevronRight size={20} className="text-slate-300" />
        </button>

        <button 
          onClick={onNavigateToGuide}
          className="w-full bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between active:scale-[0.98] transition-all border border-transparent hover:border-primary/20"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary shadow-inner">
                    <Info size={24} />
                </div>
                <div className="text-left">
                    <h4 className="text-base font-black text-darkBlue uppercase tracking-tight">Guía de Uso</h4>
                    <p className="text-[10px] text-textMedium font-bold">Cómo navegar tu salud celular</p>
                </div>
            </div>
            <ChevronRight size={20} className="text-slate-300" />
        </button>
      </div>

      {/* Legal Footer */}
      <div className="text-center pt-8 pb-12 opacity-40">
        <p className="text-[9px] font-black text-darkBlue uppercase tracking-[0.3em] mb-3">
          DOCTOR ANTIVEJEZ © 2024
        </p>
        <div className="flex justify-center gap-8">
           <span className="text-[10px] font-bold text-primary underline">Privacidad</span>
           <span className="text-[10px] font-bold text-primary underline">Términos</span>
        </div>
      </div>
    </div>
  );
};

export default AboutView;

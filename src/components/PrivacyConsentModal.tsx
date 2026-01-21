
import React from 'react';
import { ShieldCheck, Lock, CheckCircle, ArrowRight } from 'lucide-react';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onAccept: () => void | Promise<void>;
}

const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({ isOpen, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 animate-in fade-in duration-500">
      {/* Backdrop con desenfoque profundo para privacidad */}
      <div className="absolute inset-0 bg-darkBlue/90 backdrop-blur-xl" />

      <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-500 border border-white/20 flex flex-col items-center">

        <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-8 shadow-inner">
          <ShieldCheck size={40} strokeWidth={2.5} />
        </div>

        <h3 className="text-2xl font-black text-darkBlue uppercase tracking-tighter text-center leading-tight mb-4">
          Protección de Datos <br /> y Privacidad
        </h3>

        <div className="bg-slate-50 p-6 rounded-[2rem] border border-gray-100 mb-8">
          <p className="text-[13px] font-bold text-textMedium leading-relaxed text-center italic">
            "Su información clínica y biomarcadores son tratados bajo los más estrictos estándares internacionales de seguridad (GDPR/HIPAA). Garantizamos la confidencialidad absoluta de sus datos sensibles encriptados de extremo a extremo."
          </p>
        </div>

        <div className="space-y-4 w-full">
          <div className="flex items-center gap-3 px-4">
            <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-500">
              <CheckCircle size={16} />
            </div>
            <span className="text-[10px] font-black text-darkBlue uppercase tracking-widest">Encriptación Militar</span>
          </div>
          <div className="flex items-center gap-3 px-4">
            <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-500">
              <CheckCircle size={16} />
            </div>
            <span className="text-[10px] font-black text-darkBlue uppercase tracking-widest">Cumplimiento Internacional</span>
          </div>
        </div>

        <button
          onClick={onAccept}
          className="w-full bg-darkBlue text-white py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-darkBlue/20 mt-10 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <span>Acepto y Continuar</span>
          <ArrowRight size={20} />
        </button>

        <p className="mt-6 text-[9px] font-black text-textLight uppercase tracking-widest">
          Doctor Antivejez • Capa de Seguridad v2.0
        </p>
      </div>
    </div>
  );
};

export default PrivacyConsentModal;

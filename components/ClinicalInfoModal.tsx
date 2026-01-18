
import React from 'react';
import { X, ShieldCheck, Zap } from 'lucide-react';

interface ClinicalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClinicalInfoModal: React.FC<ClinicalInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-darkBlue/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300 border border-white/20">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-gray-100 dark:bg-slate-700 rounded-full text-gray-400 hover:text-darkBlue transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
            <ShieldCheck size={32} strokeWidth={2.5} />
          </div>
          
          <h3 className="text-xl font-black text-darkBlue dark:text-white uppercase tracking-tighter mb-4">
            Rigor Clínico
          </h3>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-gray-100 dark:border-slate-700">
            <p className="text-sm font-bold text-textMedium dark:text-slate-300 leading-relaxed italic">
              "Basado en algoritmos de biomarcadores validados y protocolos de medicina antienvejecimiento."
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 text-primary">
            <Zap size={16} fill="currentColor" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Doctor Antivejez</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicalInfoModal;

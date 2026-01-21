
import React from 'react';
import { AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface BioAgeAlertProps {
  bioAge: number;
  chronoAge: number;
  onAction: () => void;
}

const BioAgeAlert: React.FC<BioAgeAlertProps> = ({ bioAge, chronoAge, onAction }) => {
  const gap = bioAge - chronoAge;

  // Only show if biological age is greater than chronological age
  if (gap <= 0) return null;

  return (
    <div className="mx-6 mt-4 animate-in slide-in-from-top-4 duration-700 ease-out">
      <div className="bg-amber-50 border-2 border-amber-100 rounded-[2.5rem] p-6 shadow-xl shadow-amber-900/5 relative overflow-hidden">
        {/* Decorative background pulse */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-200/20 rounded-full blur-2xl animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-500 p-2 rounded-xl text-white shadow-lg shadow-amber-500/30">
              <AlertTriangle size={20} strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-black text-darkBlue uppercase tracking-tighter leading-none">
              Regeneration Opportunity Detected!
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-[13px] font-bold text-darkBlue leading-relaxed">
              Your Biophysical Test indicates that your Biological Age <span className="text-amber-600">({bioAge})</span> is currently higher than your Chronological Age <span className="text-slate-400">({chronoAge})</span>. 
              <br /><br />
              This <span className="bg-amber-200 px-1.5 rounded-md">+ {gap} year gap</span> is a signal that your cells need support. The good news is: through your Patient Guide and Nutrigenomic Plan, you have the validated tools to reverse this marker. Every action you take today counts toward your rejuvenation!
            </p>

            <button 
              onClick={onAction}
              className="w-full bg-darkBlue text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] shadow-lg shadow-darkBlue/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              View Today's Mission
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-amber-100/50">
               <ShieldCheck size={12} className="text-amber-400" />
               <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                 Basado en biomarcadores validados • Rigor Clínico
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BioAgeAlert;

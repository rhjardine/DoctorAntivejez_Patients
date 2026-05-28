import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft } from 'lucide-react';

interface FeatureGateViewProps {
  featureName: string;
  description?: string;
}

// Single responsibility: communicate honestly that a feature is in development.
// Used as a drop-in replacement for routes that expose mock data to Beta patients.
const FeatureGateView: React.FC<FeatureGateViewProps> = ({
  featureName,
  description,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full
                    p-8 text-center animate-in fade-in duration-500
                    bg-[var(--background)]">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center
                      justify-center text-slate-300 mb-6 shadow-inner">
        <Clock size={32} />
      </div>

      <h2 className="text-xl font-black text-darkBlue uppercase
                     tracking-tighter mb-3">
        {featureName}
      </h2>

      <p className="text-sm font-bold text-textMedium leading-relaxed
                    max-w-xs mb-8">
        {description ||
          'Esta función está en desarrollo y estará disponible ' +
          'en una próxima actualización.'}
      </p>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-6 py-3 bg-white
                   rounded-2xl border border-slate-100 shadow-sm
                   text-[11px] font-black text-darkBlue uppercase
                   tracking-widest hover:border-primary/20
                   active:scale-95 transition-all"
      >
        <ChevronLeft size={14} />
        Volver
      </button>
    </div>
  );
};

export default FeatureGateView;


import React, { useEffect, useState } from 'react';
import { ConsultationRecord } from '../types';
import { fetchConsultationHistory } from '../services/patientDataService';
import { Calendar, User, FileText, ChevronRight, ArrowLeft, Award, TrendingDown, Loader2, Info } from 'lucide-react';

interface ConsultationHistoryViewProps {
  onBack: () => void;
  onInfoPress?: () => void;
}

const ConsultationHistoryView: React.FC<ConsultationHistoryViewProps> = ({ onBack, onInfoPress }) => {
  const [history, setHistory] = useState<ConsultationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchConsultationHistory();
        setHistory(data);
      } catch (e) {
        console.error("Error loading history", e);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-pearlyGray p-10 text-center">
        <Loader2 size={40} className="text-primary animate-spin mb-4" />
        <h3 className="font-bold text-darkBlue">Cargando Historial Médico...</h3>
        <p className="text-xs text-textMedium mt-2">Estamos recuperando tus sesiones anteriores.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-pearlyGray animate-in fade-in slide-in-from-right duration-500 absolute inset-0 z-40 overflow-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-4 pt-12 pb-6 shadow-md z-10 sticky top-0 border-b border-gray-100">
         <div className="flex items-center gap-4">
             <button 
                onClick={onBack}
                className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-full active:scale-90 transition-transform"
             >
                 <ArrowLeft size={28} className="text-darkBlue dark:text-white" />
             </button>
             <div>
                <h2 className="text-2xl font-black text-darkBlue dark:text-white leading-none tracking-tight">Mis Consultas</h2>
                <span className="text-sm font-bold text-primary uppercase mt-1 block tracking-widest">Historial Clínico</span>
             </div>
         </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
        {history.length === 0 ? (
          <div className="text-center py-20 opacity-40">
             <FileText size={60} className="mx-auto mb-4" />
             <p className="font-bold">No hay consultas registradas aún.</p>
          </div>
        ) : (
          history.sort((a,b) => b.date.localeCompare(a.date)).map((record) => (
            <div key={record.consultationId} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border-2 border-transparent hover:border-primary/20 transition-all group relative overflow-hidden">
               <button 
                 onClick={onInfoPress}
                 className="absolute top-6 right-16 text-slate-200 group-hover:text-primary transition-colors"
               >
                 <Info size={14} />
               </button>
               
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl">
                     <Calendar size={18} className="text-primary" />
                     <span className="font-black text-darkBlue dark:text-white text-sm">{record.date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-accentGreen bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-xl border border-green-100 dark:border-green-800">
                     <Award size={14} fill="currentColor" />
                     <span className="text-xs font-black">{record.adherenceRate}% Adherencia</span>
                  </div>
               </div>

               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-darkBlue flex items-center justify-center text-white">
                     <User size={20} />
                  </div>
                  <div>
                     <h4 className="font-black text-darkBlue dark:text-white text-base leading-tight">{record.doctorName}</h4>
                     <p className="text-xs text-textMedium font-bold">Especialista en Longevidad</p>
                  </div>
               </div>

               <div className="bg-pearlyGray dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-600">
                  <div className="flex items-center gap-2 mb-2">
                     <FileText size={14} className="text-primary" />
                     <span className="text-[10px] font-black text-textMedium uppercase tracking-widest">Notas del Doctor</span>
                  </div>
                  <p className="text-sm text-darkBlue dark:text-slate-200 leading-relaxed font-medium italic">
                    "{record.doctorNotes}"
                  </p>
               </div>

               <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-textLight uppercase">Edad Bio</span>
                        <span className="font-black text-primary">{record.biologicalAgeAtTime} años</span>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-textLight uppercase">Mejoría</span>
                        <div className="flex items-center gap-1 text-accentGreen">
                           <TrendingDown size={14} />
                           <span className="font-black">-{record.chronologicalAgeAtTime - record.biologicalAgeAtTime} años</span>
                        </div>
                     </div>
                  </div>
                  <button className="p-2 bg-gray-50 dark:bg-slate-700 rounded-xl text-gray-300 group-hover:text-primary transition-colors">
                     <ChevronRight size={24} />
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsultationHistoryView;

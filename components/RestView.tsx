import React from 'react';
import { ListChecks, BarChart2, Music, BookOpen, Power, ChevronRight } from 'lucide-react';

const RestView: React.FC = () => {
  const tools = [
    {
      title: "Optimizador Rutina Pre-Sueño",
      desc: "Crea y sigue tu secuencia ideal para relajarte antes de dormir.",
      iconComponent: <ListChecks size={20} />,
      color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
    },
    {
      title: "Análisis Avanzado del Sueño",
      desc: "Visualiza fases, consistencia y HRV nocturno (con wearables).",
      iconComponent: <BarChart2 size={20} />,
      color: "bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400"
    },
    {
      title: "Biblioteca de Sonidos",
      desc: "Ruido blanco, naturaleza, ASMR y más para ayudarte a dormir.",
      iconComponent: <Music size={20} />,
      color: "bg-purple-100 text-purple-500 dark:bg-purple-900/30 dark:text-purple-400"
    },
    {
      title: "Diario de Sueño Inteligente",
      desc: "Registra hábitos y descubre qué factores afectan tu descanso.",
      iconComponent: <BookOpen size={20} />,
      color: "bg-pink-100 text-pink-500 dark:bg-pink-900/30 dark:text-pink-400"
    },
    {
      title: "Guía sobre Siestas (Power Naps)",
      desc: "Aprende a hacer siestas efectivas sin afectar tu noche.",
      iconComponent: <Power size={20} />,
      color: "bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
    }
  ];

  return (
    <div className="flex flex-col pb-24 px-4 pt-4 space-y-3">
       {tools.map((tool, index) => (
         <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-slate-700 hover:border-gray-100">
             <div className="flex items-center gap-4 overflow-hidden">
                 <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center flex-shrink-0`}>
                     {tool.iconComponent}
                 </div>
                 <div className="flex-1 min-w-0">
                     <h4 className="text-sm font-semibold text-darkBlue dark:text-white truncate">{tool.title}</h4>
                     <p className="text-[11px] text-textMedium dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">{tool.desc}</p>
                 </div>
             </div>
             <ChevronRight size={18} className="text-gray-300 dark:text-slate-600 flex-shrink-0 ml-2" />
         </div>
       ))}
    </div>
  );
};

export default RestView;
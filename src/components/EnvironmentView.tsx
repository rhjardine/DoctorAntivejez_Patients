import React from 'react';
import { BedDouble, Sun, EyeOff, Leaf, FlaskConical, ChevronRight } from 'lucide-react';

const EnvironmentView: React.FC = () => {
  const tools = [
    {
      title: "Santuario del Descanso",
      desc: "Optimiza tu dormitorio para un sueño reparador.",
      iconComponent: <BedDouble size={20} />,
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
    },
    {
      title: "Guía de Luz Circadiana",
      desc: "Gestiona la exposición a la luz para regular tus ritmos.",
      iconComponent: <Sun size={20} />,
      color: "bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400"
    },
    {
      title: "Detox Digital Consciente",
      desc: "Reduce el impacto negativo de las pantallas y notificaciones.",
      iconComponent: <EyeOff size={20} />,
      color: "bg-gray-200 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
    },
    {
      title: "\"Biophilia\" en Casa",
      desc: "Ideas para integrar elementos naturales en tu hogar.",
      iconComponent: <Leaf size={20} />,
      color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
    },
    {
      title: "Evaluación de Tóxicos",
      desc: "Identifica y reduce la exposición a tóxicos comunes.",
      iconComponent: <FlaskConical size={20} />,
      color: "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400"
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

export default EnvironmentView;
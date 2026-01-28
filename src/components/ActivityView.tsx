import React from 'react';
import { Activity, Dumbbell, HeartPulse, Gauge, Move, ChevronRight, Check, CheckCircle2 } from 'lucide-react';
import apiClient from '../services/apiClient';

const ActivityView: React.FC = () => {
  const [completedActivities, setCompletedActivities] = React.useState<Record<string, boolean>>({});
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleCheckIn = async (activityType: string, title: string) => {
    // Prevent double submission
    if (completedActivities[activityType]) return;

    setLoading(activityType);
    try {
      const response = await apiClient.post('/mobile-adherence-v1', {
        type: activityType,
        points: 20, // Default points per activity
        notes: `Completed: ${title}`,
        metadata: { source: 'mobile_manual' }
      });

      if (response.data.success) {
        setCompletedActivities(prev => ({ ...prev, [activityType]: true }));
        // Ideally show a toast here
      }
    } catch (error) {
      console.error("Check-in failed", error);
    } finally {
      setLoading(null);
    }
  };

  const tools = [
    {
      id: "WEARABLE",
      title: "Monitor de Actividad (Wearables)",
      desc: "Sincroniza tus pasos, calorías y zonas de frecuencia cardíaca.",
      iconComponent: <Activity size={20} />,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
    },
    {
      id: "STRENGTH",
      title: "Entrenamiento de Fuerza",
      desc: "Rutinas para preservar masa muscular y densidad ósea.",
      iconComponent: <Dumbbell size={20} />,
      color: "bg-gray-200 text-darkBlue dark:bg-slate-700 dark:text-slate-300"
    },
    {
      id: "CARDIO_Z2",
      title: "Cardio Zona 2 (Mitocondrial)",
      desc: "Entrenamiento de baja intensidad para salud celular.",
      iconComponent: <HeartPulse size={20} />,
      color: "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400"
    },
    {
      id: "HIIT",
      title: "HIIT / VO2 Max",
      desc: "Protocolos de alta intensidad para capacidad cardiorrespiratoria.",
      iconComponent: <Gauge size={20} />,
      color: "bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400"
    },
    {
      id: "MOBILITY",
      title: "Movilidad y Estabilidad",
      desc: "Ejercicios diarios para articulaciones y prevención de caídas.",
      iconComponent: <Move size={20} />,
      color: "bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-400"
    }
  ];

  return (
    <div className="flex flex-col pb-24 px-4 pt-4 space-y-3">
      {tools.map((tool, index) => {
        const isDone = completedActivities[tool.id];
        const isLoading = loading === tool.id;

        return (
          <div
            key={index}
            onClick={() => handleCheckIn(tool.id, tool.title)}
            className={`p-4 rounded-xl shadow-sm flex items-center justify-between cursor-pointer transition-all border border-transparent 
                ${isDone
                ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20'
                : 'bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:border-gray-100'
              }`}
          >
            <div className="flex items-center gap-4 overflow-hidden">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform ${isDone ? 'bg-emerald-100 text-emerald-600 scale-110' : tool.color}`}>
                {isDone ? <CheckCircle2 size={20} /> : tool.iconComponent}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold truncate ${isDone ? 'text-emerald-700 dark:text-emerald-400' : 'text-darkBlue dark:text-white'}`}>
                  {tool.title}
                </h4>
                <p className="text-[11px] text-textMedium dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                  {isDone ? '¡Completado hoy!' : tool.desc}
                </p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isDone ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 dark:border-slate-600'}`}>
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isDone ? (
                <Check size={14} className="text-white" />
              ) : (
                <div className="w-full h-full rounded-full"></div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  );
};

export default ActivityView;
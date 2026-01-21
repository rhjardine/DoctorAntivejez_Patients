import React, { useState } from 'react';
import { COLORS } from '../types';
import { Book, Smile, Brain, Users, Star, ChevronRight, X, Loader2, CheckCircle, Save } from 'lucide-react';

const AttitudeView: React.FC = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [journalText, setJournalText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tools = [
    {
      id: 'meditations',
      title: "Micro-Meditaciones Guiadas",
      desc: "Audios cortos (3-5 min) para gratitud, estrés, optimismo.",
      iconComponent: <Smile size={20} />,
      color: "bg-cyan-100 text-cyan-600"
    },
    {
      id: 'journal',
      title: "Diario de Gratitud (con IA)",
      desc: "Registra tus agradecimientos y descubre patrones positivos.",
      iconComponent: <Book size={20} />,
      color: "bg-pink-100 text-pink-500"
    },
    {
      id: 'cbt',
      title: "Reencuadre Cognitivo (CBT)",
      desc: "Identifica y transforma pensamientos negativos sobre salud.",
      iconComponent: <Brain size={20} />,
      color: "bg-indigo-100 text-indigo-500"
    },
    {
      id: 'social',
      title: "Rueda de Conexión Social",
      desc: "Evalúa y planifica cómo nutrir tus relaciones importantes.",
      iconComponent: <Users size={20} />,
      color: "bg-orange-100 text-orange-500"
    },
    {
      id: 'moments',
      title: "Banco de Momentos Cumbre",
      desc: "Guarda y recuerda tus logros y momentos positivos.",
      iconComponent: <Star size={20} />,
      color: "bg-yellow-100 text-yellow-600"
    }
  ];

  const handleToolClick = (toolId: string) => {
    if (toolId === 'journal') {
      setIsJournalModalOpen(true);
    }
    // Other tools would have their own logic
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim() || isSubmitting) return;

    setIsSubmitting(true);

    // Simulate network delay for the save action
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Simulated Save
    console.log("Saving journal entry:", journalText);
    
    setIsSubmitting(false);
    setIsJournalModalOpen(false);
    setJournalText('');

    // Show Success Feedback
    setSuccessMessage('Entrada guardada con éxito');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  return (
    <div className="flex flex-col pb-24 px-4 pt-4 space-y-3 relative">
      
      {/* Success Toast Notification */}
      {successMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="bg-green-600 text-white px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2">
              <CheckCircle size={16} />
              <span className="text-xs font-bold">{successMessage}</span>
           </div>
        </div>
      )}

      {/* Header Context */}
      <div className="bg-gradient-to-r from-pink-50 to-white dark:from-slate-800 dark:to-slate-900 p-4 rounded-xl border border-pink-100 dark:border-slate-700 mb-1 transition-colors duration-300">
         <h2 className="text-darkBlue dark:text-white font-bold text-lg">Mente y Actitud</h2>
         <p className="text-xs text-textMedium dark:text-slate-400 leading-relaxed mt-1">
            Una actitud positiva modula la expresión génica y reduce el cortisol celular.
         </p>
      </div>

      {/* Tools List */}
      {tools.map((tool) => (
        <div 
          key={tool.id} 
          onClick={() => handleToolClick(tool.id)}
          className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-all border border-transparent dark:border-slate-700 hover:border-gray-100 active:scale-[0.98]"
        >
          <div className="flex items-center gap-4 overflow-hidden">
            <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center flex-shrink-0`}>
              {tool.iconComponent}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-darkBlue dark:text-white truncate">{tool.title}</h4>
              <p className="text-[11px] text-textMedium dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">{tool.desc}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-gray-300 flex-shrink-0 ml-2" />
        </div>
      ))}

      {/* Gratitude Journal Modal */}
      {isJournalModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 border border-transparent dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-pink-100 p-2 rounded-xl text-pink-500">
                  <Book size={20} />
                </div>
                <h3 className="font-bold text-xl text-darkBlue dark:text-white">Diario de Gratitud</h3>
              </div>
              <button 
                onClick={() => !isSubmitting && setIsJournalModalOpen(false)} 
                className="p-1 bg-gray-100 dark:bg-slate-700 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveJournal} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-textMedium dark:text-slate-400 uppercase tracking-wider">
                  ¿Por qué estás agradecido hoy?
                </label>
                <textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Hoy agradezco por..."
                  className="w-full h-40 p-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400/50 text-darkBlue dark:text-white text-sm resize-none transition-all"
                  autoFocus
                />
                <p className="text-[10px] text-textLight dark:text-slate-500 italic">
                  Escribir 3 cosas positivas al día reprograma tu cerebro hacia la longevidad.
                </p>
              </div>

              <button 
                type="submit"
                disabled={!journalText.trim() || isSubmitting}
                className="w-full bg-pink-500 text-white py-4 rounded-xl font-bold shadow-md hover:bg-pink-600 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Guardar Entrada</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttitudeView;
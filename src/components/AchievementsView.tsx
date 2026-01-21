
import React, { useState } from 'react';
import { Trophy, Gift, Lock, Coins, TrendingUp, Star, Crown, Zap, Shield, X, ChevronRight } from 'lucide-react';
import { COLORS } from '../types';

interface AchievementsViewProps {
  onClose?: () => void;
  isPage?: boolean;
}

const AchievementsView: React.FC<AchievementsViewProps> = ({ onClose, isPage = true }) => {
  const [activeTab, setActiveTab] = useState<'BADGES' | 'REWARDS'>('BADGES');

  // Mock Data
  const omicsBalance = 1250;
  const currentLevel = "Bio-Hacker Iniciado";
  const levelProgress = 65;

  const achievements = [
    { id: 1, title: "Primeros Pasos", desc: "Completa 5 días.", icon: <TrendingUp size={20} />, color: "bg-blue-100 text-blue-600", unlocked: true },
    { id: 2, title: "Sueño Profundo", desc: "7h+ por 3 noches.", icon: <Star size={20} />, color: "bg-purple-100 text-purple-600", unlocked: true },
    { id: 3, title: "Nutrición Consciente", desc: "Registro 1 semana.", icon: <Zap size={20} />, color: "bg-orange-100 text-orange-600", unlocked: true },
    { id: 4, title: "Ayuno Maestro", desc: "10 ayunos intermitentes.", icon: <Shield size={20} />, color: "bg-gray-100 text-gray-400", unlocked: false },
    { id: 5, title: "Racha Imparable", desc: "30 días continuos.", icon: <Crown size={20} />, color: "bg-gray-100 text-gray-400", unlocked: false },
  ];

  const rewards = [
    { id: 1, title: "10% Suplementos", cost: 500, icon: <Gift size={24} />, type: "COUPON" },
    { id: 2, title: "Consulta Express", cost: 2500, icon: <Zap size={24} />, type: "SERVICE" },
    { id: 3, title: "Ebook Recetas", cost: 800, icon: <Star size={24} />, type: "DIGITAL" },
    { id: 4, title: "Test Microbiota", cost: 5000, icon: <Shield size={24} />, type: "TEST" },
  ];

  const content = (
    <div className={`relative w-full ${isPage ? 'h-full bg-pearlyGray' : 'bg-white dark:bg-slate-900 rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh]'} flex flex-col`}>
      
      {!isPage && onClose && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-50">
           <button 
             onClick={onClose}
             className="bg-primary text-white p-3 rounded-full shadow-lg border-4 border-pearlyGray dark:border-slate-800 hover:scale-105 active:scale-95 transition-transform"
           >
             <X size={24} strokeWidth={3} />
           </button>
        </div>
      )}

      {/* Content Scrollable Area */}
      <div className={`overflow-y-auto no-scrollbar ${isPage ? 'pt-8' : 'pt-10'} pb-32 px-6`}>
          
          {/* Header / Wallet Info */}
          <div className="flex flex-col items-center mb-6">
              <h2 className="text-2xl font-black text-darkBlue dark:text-white mb-1 tracking-tight">Centro de Logros</h2>
              <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-5 py-2 rounded-full border border-yellow-100 dark:border-yellow-900/30 shadow-sm">
                  <Coins size={18} className="text-accentYellow" fill={COLORS.AccentYellow} />
                  <span className="font-black text-yellow-800 dark:text-yellow-400 text-lg">{omicsBalance} Omics</span>
              </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex bg-gray-200/50 dark:bg-slate-800 p-1.5 rounded-[1.5rem] mb-6">
              <button 
                onClick={() => setActiveTab('BADGES')}
                className={`flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'BADGES' ? 'bg-white dark:bg-slate-700 text-primary shadow-md' : 'text-gray-400 dark:text-slate-500'}`}
              >
                 Insignias
              </button>
              <button 
                onClick={() => setActiveTab('REWARDS')}
                className={`flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === 'REWARDS' ? 'bg-white dark:bg-slate-700 text-primary shadow-md' : 'text-gray-400 dark:text-slate-500'}`}
              >
                 Canjear
              </button>
          </div>

          {/* Grid Content */}
          {activeTab === 'BADGES' ? (
              <div className="grid grid-cols-2 gap-4">
                  {/* Level Progress Widget - Matching Screenshot */}
                  <div className="col-span-2 bg-gradient-to-br from-primary via-blue-400 to-blue-500 p-6 rounded-[2rem] text-white shadow-xl shadow-primary/20 mb-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <Crown size={80} />
                      </div>
                      <div className="flex justify-between items-start mb-4 relative z-10">
                          <div>
                              <span className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em]">Nivel Actual</span>
                              <h3 className="font-black text-2xl leading-tight tracking-tighter">{currentLevel}</h3>
                          </div>
                          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                            <Crown size={28} className="text-white" />
                          </div>
                      </div>
                      <div className="w-full bg-black/15 h-4 rounded-full overflow-hidden mb-2 shadow-inner border border-white/10">
                          <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${levelProgress}%` }}></div>
                      </div>
                      <div className="text-right">
                          <span className="text-[11px] font-black uppercase tracking-widest opacity-90">{levelProgress}% para subir de nivel</span>
                      </div>
                  </div>

                  {achievements.map((item) => (
                      <div key={item.id} className={`p-5 rounded-[2rem] border-2 flex flex-col items-center text-center gap-3 transition-all active:scale-95 ${
                          item.unlocked 
                          ? 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-700 shadow-sm' 
                          : 'bg-gray-50 dark:bg-slate-800/50 border-transparent opacity-60 grayscale'
                      }`}>
                          <div className={`p-4 rounded-full shadow-inner ${item.unlocked ? item.color : 'bg-gray-200'}`}>
                              {item.icon}
                          </div>
                          <div>
                              <h4 className="font-black text-[13px] text-darkBlue dark:text-white leading-tight uppercase tracking-tight">{item.title}</h4>
                              <p className="text-[10px] font-bold text-gray-400 mt-1 line-clamp-2">{item.desc}</p>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <div className="grid grid-cols-2 gap-4">
                   <div className="col-span-2 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-[2rem] border border-blue-100 dark:border-blue-800 flex gap-4 items-center mb-2">
                      <div className="bg-white p-3 rounded-2xl shadow-sm text-primary">
                        <Gift size={28} strokeWidth={2.5} />
                      </div>
                      <p className="text-xs text-darkBlue dark:text-blue-200 font-bold leading-tight">
                         Canjea tus Omics por descuentos exclusivos en tratamientos clínicos o suplementos.
                      </p>
                   </div>

                   {rewards.map((reward) => (
                      <div key={reward.id} className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border-2 border-gray-100 dark:border-slate-700 shadow-sm hover:border-primary cursor-pointer group transition-all active:scale-95">
                           <div className="flex justify-between items-start mb-3">
                               <div className="w-12 h-12 bg-gray-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-darkBlue dark:text-white group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                   {reward.icon}
                               </div>
                               <div className="bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-1 rounded-lg border border-yellow-100">
                                   <span className="text-[11px] font-black text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                                       <Coins size={10} /> {reward.cost}
                                   </span>
                               </div>
                           </div>
                           <h4 className="font-black text-sm text-darkBlue dark:text-white mb-2 group-hover:text-primary transition-colors leading-tight">
                               {reward.title}
                           </h4>
                           <div className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest text-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                               Canjear
                           </div>
                      </div>
                   ))}
              </div>
          )}
      </div>
    </div>
  );

  if (!isPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-darkBlue/80 backdrop-blur-[2px] animate-in fade-in duration-300" 
          onClick={onClose}
        />
        {content}
      </div>
    );
  }

  return content;
};

export default AchievementsView;

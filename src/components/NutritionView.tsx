
import React, { useState } from 'react';
import { COLORS } from '../types';
import { Dna, Salad, ScanBarcode, Flame, Drumstick, Droplet, ChevronRight, Zap, ArrowRight, LayoutDashboard } from 'lucide-react';
import CircularProgress from './CircularProgress';
import FoodScannerModal from './FoodScannerModal';
import NutrigenomicsView from './NutrigenomicsView';

const NutritionView: React.FC = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showNutrigenomics, setShowNutrigenomics] = useState(false);

  if (showNutrigenomics) {
      return <NutrigenomicsView onBack={() => setShowNutrigenomics(false)} />;
  }

  return (
    <div className="flex flex-col pb-32 space-y-6 pt-4 animate-in fade-in duration-500">
      
      {/* 1. Compact Daily Summary - Optimized for Seniors (Large Text, High Contrast) */}
      <div className="mx-4 bg-darkBlue rounded-3xl shadow-lg p-5 flex items-center justify-between border-b-4 border-primary/30">
         <div className="flex items-center gap-5 w-full">
             <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                <CircularProgress 
                    percentage={66} 
                    label="" 
                    icon={<span className="text-sm font-bold text-white">66%</span>} 
                    color={COLORS.PrimaryBlue}
                    size={70}
                    fillColor="transparent"
                />
             </div>
             
             <div className="flex flex-col flex-1">
                 <div className="flex justify-between items-baseline">
                    <h2 className="text-base font-bold text-white/90 uppercase tracking-tight">Consumo Hoy</h2>
                    <span className="text-2xl font-black text-primary">1,450</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[66%] rounded-full"></div>
                    </div>
                    <span className="text-[11px] font-bold text-white/60">de 2,200 kcal</span>
                 </div>
             </div>
         </div>
      </div>

      {/* 2. Smart Tools - Larger Targets for Better Accessibility */}
      <div className="px-4 space-y-5">
         <div className="flex items-center gap-2 mb-1 px-1">
             <div className="bg-primary p-1.5 rounded-lg text-white shadow-sm">
                <Zap size={20} strokeWidth={2.5} />
             </div>
             <h3 className="text-darkBlue font-black text-xl tracking-tight">Acciones Rápidas</h3>
         </div>

         {/* Plan Nutrigenómico - High Priority Card */}
         <button 
             onClick={() => setShowNutrigenomics(true)}
             aria-label="Abrir plan de alimentación basado en ADN"
             className="w-full bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 p-5 rounded-[2.5rem] shadow-sm relative overflow-hidden group active:scale-[0.97] transition-all text-left flex items-center gap-5"
         >
             <div className="w-16 h-16 bg-purple-600 rounded-2xl shadow-lg flex items-center justify-center text-white flex-shrink-0 group-hover:rotate-6 transition-transform">
                 <Dna size={32} strokeWidth={2.5} />
             </div>
             
             <div className="flex-1">
                 <div className="flex items-center gap-2">
                    <h4 className="text-lg font-black text-darkBlue dark:text-white leading-tight">Plan Nutrigenómico</h4>
                    <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Vital</span>
                 </div>
                 <p className="text-sm text-textMedium dark:text-slate-400 font-medium leading-tight mt-1">
                     Alimentación Sana Antienvejecimiento Personalizada
                 </p>
             </div>
             <ChevronRight size={24} className="text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
         </button>

         <div className="grid grid-cols-1 gap-4">
             {/* Mi Menú Saludable - Large Block */}
             <button className="bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 p-5 rounded-[2.5rem] shadow-sm group active:scale-[0.97] transition-all flex items-center gap-5 text-left">
                 <div className="w-14 h-14 bg-accentGreen rounded-2xl shadow-md flex items-center justify-center text-white flex-shrink-0 group-hover:-rotate-3 transition-transform">
                     <Salad size={28} />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-lg font-black text-darkBlue dark:text-white leading-tight">Mi Menú Visual</h4>
                    <p className="text-sm text-textMedium dark:text-slate-400 font-medium leading-tight">Plan de comidas balanceado.</p>
                 </div>
                 <ChevronRight size={24} className="text-gray-300 group-hover:text-accentGreen" />
             </button>

             {/* Escáner IA - High Contrast Primary Tool */}
             <button 
                onClick={() => setIsScannerOpen(true)}
                aria-label="Escanear producto con cámara"
                className="bg-primary p-5 rounded-[2.5rem] shadow-xl shadow-primary/20 group active:scale-[0.97] transition-all flex items-center gap-5 text-left border-b-4 border-darkBlue/20"
             >
                 <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-110 transition-transform">
                     <ScanBarcode size={28} strokeWidth={2.5} />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-lg font-black text-white leading-tight">Escáner de Alimentos</h4>
                    <p className="text-sm text-white/80 font-bold leading-tight">Analiza etiquetas con IA.</p>
                 </div>
                 <div className="bg-white/20 p-2 rounded-full text-white">
                    <ArrowRight size={20} strokeWidth={3} />
                 </div>
             </button>
         </div>

         {/* Extra Helper Tip for Seniors */}
         <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
            <div className="mt-1"><Zap size={16} className="text-primary" /></div>
            <p className="text-xs font-bold text-darkBlue/70 dark:text-blue-200 leading-snug">
              Tip: Usa el escáner si tienes dudas sobre el azúcar en los productos procesados.
            </p>
         </div>
      </div>
      
      {isScannerOpen && (
          <FoodScannerModal onClose={() => setIsScannerOpen(false)} />
      )}

    </div>
  );
};

export default NutritionView;

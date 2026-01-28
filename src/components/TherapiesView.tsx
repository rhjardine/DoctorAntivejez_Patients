import React, { useState } from 'react';
import { Trash2, Flame, Activity, RefreshCw } from 'lucide-react'; // Example icons
import RemovalView from './Therapies/RemovalView';

type TherapyPhase = 'removal' | 'revitalization' | 'regeneration' | 'restoration';

const TherapiesView: React.FC = () => {
    const [activePhase, setActivePhase] = useState<TherapyPhase>('removal');

    const renderContent = () => {
        switch (activePhase) {
            case 'removal':
                return <RemovalView />;
            case 'revitalization':
                return <div className="p-10 text-center text-slate-400 font-bold">Fase de Revitalización (Próximamente)</div>;
            case 'regeneration':
                return <div className="p-10 text-center text-slate-400 font-bold">Fase de Regeneración (Próximamente)</div>;
            case 'restoration':
                return <div className="p-10 text-center text-slate-400 font-bold">Fase de Restauración (Próximamente)</div>;
            default:
                return <RemovalView />;
        }
    };

    return (
        <div className="flex flex-col w-full h-full relative">
            {/* Top Tabs Navigation - Sticky */}
            <div className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-md border-b border-slate-200/50 pb-2 pt-2 px-2 shadow-sm">
                <div className="flex p-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActivePhase('removal')}
                        className={`flex-1 min-w-[80px] flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all ${activePhase === 'removal'
                                ? 'bg-[#293b64] text-white shadow-md'
                                : 'text-slate-400 hover:bg-slate-50'
                            }`}
                    >
                        <Trash2 size={16} strokeWidth={2.5} className="mb-1" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Remoción</span>
                    </button>

                    <button
                        onClick={() => setActivePhase('revitalization')}
                        className={`flex-1 min-w-[80px] flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all ${activePhase === 'revitalization'
                                ? 'bg-[#293b64] text-white shadow-md'
                                : 'text-slate-400 hover:bg-slate-50'
                            }`}
                    >
                        <Flame size={16} strokeWidth={2.5} className="mb-1" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Revital</span>
                    </button>

                    <button
                        onClick={() => setActivePhase('regeneration')}
                        className={`flex-1 min-w-[80px] flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all ${activePhase === 'regeneration'
                                ? 'bg-[#293b64] text-white shadow-md'
                                : 'text-slate-400 hover:bg-slate-50'
                            }`}
                    >
                        <Activity size={16} strokeWidth={2.5} className="mb-1" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Regen</span>
                    </button>

                    <button
                        onClick={() => setActivePhase('restoration')}
                        className={`flex-1 min-w-[80px] flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all ${activePhase === 'restoration'
                                ? 'bg-[#293b64] text-white shadow-md'
                                : 'text-slate-400 hover:bg-slate-50'
                            }`}
                    >
                        <RefreshCw size={16} strokeWidth={2.5} className="mb-1" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Restaura</span>
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                {renderContent()}
            </div>
        </div>
    );
};

export default TherapiesView;

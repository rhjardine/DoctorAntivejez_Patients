
import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, CheckCircle, Info, QrCode, ArrowLeft, Loader2 } from 'lucide-react';
import { COLORS } from '../types';

interface BioPaseViewProps {
  patientId: string;
  onRefresh: () => Promise<void>;
  onBack: () => void;
}

const BioPaseView: React.FC<BioPaseViewProps> = ({ patientId, onRefresh, onBack }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await onRefresh();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-pearlyGray animate-in slide-in-from-right duration-500 absolute inset-0 z-40 overflow-hidden">
      {/* Header */}
      <div className="bg-darkBlue px-4 pt-12 pb-6 shadow-md z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full active:scale-90 transition-transform"
          >
            <ArrowLeft size={28} className="text-white" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-white leading-none tracking-tight uppercase">Bio-Pase</h2>
            <span className="text-sm font-bold text-primary uppercase mt-1 block tracking-widest">Check-in Clínico</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col items-center">

        {/* Main QR Card */}
        <div className="w-full bg-white rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center text-center relative overflow-hidden border border-gray-100">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 p-4 opacity-5 text-darkBlue">
            <QrCode size={120} />
          </div>

          <div className="bg-primary/10 p-4 rounded-3xl mb-6 text-primary">
            <ShieldCheck size={40} />
          </div>

          <h3 className="text-xl font-black text-darkBlue uppercase tracking-tighter mb-2">Identidad Bio-Métrica</h3>
          <p className="text-xs text-textMedium font-bold mb-8 px-4">
            Muestra este código al personal de la clínica para iniciar tu consulta.
          </p>

          {/* QR Container with Icon (replaced QRCodeSVG) */}
          <div className="relative p-6 bg-gray-50 rounded-[2rem] border-2 border-primary/20 shadow-inner">
            <div className="absolute inset-0 bg-primary/5 rounded-[2rem] animate-pulse"></div>
            <div className="relative bg-white p-4 rounded-xl shadow-md flex items-center justify-center">
              {patientId ? (
                <div className="flex flex-col items-center gap-2">
                  <QrCode size={180} className="text-darkBlue" strokeWidth={1.5} />
                  <span className="text-xs font-bold text-textMedium">Scan para check-in</span>
                </div>
              ) : (
                <div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-100 text-gray-400 font-bold uppercase">
                  Error de ID
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <span className="text-[10px] font-black text-textLight uppercase tracking-[0.3em]">ID Paciente</span>
            <span className="text-lg font-black text-darkBlue tracking-widest">{patientId}</span>
          </div>
        </div>

        {/* Sync Button */}
        <div className="w-full max-w-sm flex flex-col gap-4">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className={`w-full py-5 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 ${isSyncing ? 'bg-gray-200 text-gray-500' : 'bg-primary text-white hover:bg-darkBlue'
              }`}
          >
            {isSyncing ? <Loader2 size={24} className="animate-spin" /> : <RefreshCw size={24} />}
            {isSyncing ? 'Sincronizando...' : 'Actualizar Plan'}
          </button>

          {showSuccess && (
            <div className="flex items-center justify-center gap-2 text-accentGreen font-bold text-xs animate-in fade-in slide-in-from-top-2">
              <CheckCircle size={16} />
              <span>¡DATOS ACTUALIZADOS CORRECTAMENTE!</span>
            </div>
          )}

          <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-3 border border-blue-100/50">
            <div className="mt-1"><Info size={20} className="text-primary flex-shrink-0" /></div>
            <p className="text-[10px] text-textMedium font-bold leading-relaxed">
              Al finalizar tu consulta, presiona "Actualizar Plan" para recibir inmediatamente tus nuevas indicaciones médicas.
            </p>
          </div>
        </div>

        <div className="mt-auto py-6 opacity-30 text-center">
          <p className="text-[9px] font-black text-darkBlue uppercase tracking-widest">Pase de acceso seguro v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default BioPaseView;

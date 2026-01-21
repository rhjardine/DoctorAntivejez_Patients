
import React, { useState } from 'react';
import { Plus, Activity, Heart, Scale, Droplet, X, TrendingUp, TrendingDown, Calendar, Clock, CheckCircle, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { BiometricData, BiometricType, COLORS } from '../types';

interface BiometricsViewProps {
  entries: BiometricData[];
  onAdd: (entry: Omit<BiometricData, 'id' | 'userId' | 'recordedAt' | 'source'>) => void;
  onDelete: (id: string) => void;
}

const SimpleLineChart: React.FC<{ data: number[]; color: string; height?: number }> = ({ data, color, height = 40 }) => {
  if (data.length < 2) return <div style={{ height }} className="flex items-end justify-center text-[10px] text-gray-300 dark:text-slate-600 pb-1">Sin historial</div>;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;

  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height; // Invert Y
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dots for points */}
      {data.map((val, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return (
          <circle key={index} cx={x} cy={y} r="2" fill="white" stroke={color} strokeWidth="1.5" />
        );
      })}
    </svg>
  );
};

const BiometricsView: React.FC<BiometricsViewProps> = ({ entries, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newType, setNewType] = useState<BiometricType>('WEIGHT');
  const [newValue, setNewValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Confirmation Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, type: string} | null>(null);
  
  // Date and Time state for manual entry
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordTime, setRecordTime] = useState(new Date().toTimeString().slice(0, 5));

  // Helper to extract data for charts
  const getDataByType = (type: BiometricType) => {
    return entries
      .filter(e => e.type === type)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const handleTypeChange = (type: BiometricType) => {
    setNewType(type);
    setValidationError(null);
    setNewValue('');
  };

  const renderMetricCard = (
    title: string, 
    type: BiometricType, 
    icon: React.ReactNode, 
    colorClass: string,
    unit: string,
    chartColor: string
  ) => {
    const history = getDataByType(type);
    const latest = history.length > 0 ? history[history.length - 1] : null;
    const numericHistory = history.map(e => e.numericValue);

    // Calculate trend
    let trendIcon = null;
    if (history.length >= 2) {
       const current = history[history.length - 1].numericValue;
       const prev = history[history.length - 2].numericValue;
       if (current > prev) trendIcon = <TrendingUp size={14} className="text-red-500" />;
       if (current < prev) trendIcon = <TrendingDown size={14} className="text-green-500" />;
    }

    return (
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col justify-between relative overflow-hidden group transition-colors duration-300">
        <div className="flex justify-between items-start mb-2 z-10">
           <div className="flex items-center gap-2">
             <div className={`p-2 rounded-xl ${colorClass}`}>
                {icon}
             </div>
             <div>
                <h3 className="text-sm font-semibold text-darkBlue dark:text-white">{title}</h3>
                <span className="text-[10px] text-textLight dark:text-slate-400">Último: {latest ? latest.timestamp.toLocaleDateString() : '--'}</span>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
             {trendIcon}
             {latest && (
               <button 
                 onClick={() => setDeleteConfirm({ id: latest.id, type: title })}
                 className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
               >
                 <Trash2 size={14} />
               </button>
             )}
           </div>
        </div>

        <div className="z-10 mb-2">
            <div className="flex items-baseline gap-1">
               <span className="text-2xl font-bold text-darkBlue dark:text-slate-200">{latest ? latest.value : '--'}</span>
               <span className="text-xs text-textMedium dark:text-slate-400 font-medium">{unit}</span>
            </div>
        </div>

        {/* Chart Area */}
        <div className="h-10 w-full mt-2 opacity-80">
            <SimpleLineChart data={numericHistory} color={chartColor} />
        </div>
      </div>
    );
  };

  const validateInput = (): boolean => {
    const trimmedValue = newValue.trim();
    if (!trimmedValue) {
      setValidationError('El valor es obligatorio');
      return false;
    }

    if (newType === 'BLOOD_PRESSURE') {
      // Basic validation for Systolic/Diastolic format (e.g., 120/80)
      const bpRegex = /^\d{2,3}\/\d{2,3}$/;
      if (!bpRegex.test(trimmedValue)) {
        setValidationError('Formato inválido. Use Sistólica/Diastólica (ej: 120/80)');
        return false;
      }
    } else {
      // Numeric validation for other types
      const num = parseFloat(trimmedValue);
      if (isNaN(num)) {
        setValidationError('Debe ingresar un valor numérico');
        return false;
      }
      if (num <= 0) {
        setValidationError('El valor debe ser mayor a 0');
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInput()) return;
    if (isSubmitting) return;

    setIsSubmitting(true);

    // Simulate network delay to show the spinner/processing state
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple numeric extraction for the "numericValue" field
    let numVal = parseFloat(newValue);
    if (newType === 'BLOOD_PRESSURE') {
        const parts = newValue.split('/');
        if (parts.length > 0) numVal = parseFloat(parts[0]);
    }

    let unit = '';
    if (newType === 'WEIGHT') unit = 'kg';
    if (newType === 'HEART_RATE') unit = 'bpm';
    if (newType === 'GLUCOSE') unit = 'mg/dL';
    if (newType === 'BLOOD_PRESSURE') unit = 'mmHg';

    // Construct valid timestamp from date and time inputs
    const timestamp = new Date(`${recordDate}T${recordTime}`);

    onAdd({
      type: newType,
      value: newValue,
      numericValue: numVal || 0,
      unit: unit,
      timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
    });

    // Reset Form
    setNewValue('');
    setRecordDate(new Date().toISOString().split('T')[0]);
    setRecordTime(new Date().toTimeString().slice(0, 5));
    setIsSubmitting(false);
    setIsModalOpen(false);

    // Show Success Message
    setSuccessMessage('Registro guardado con éxito');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="flex flex-col pb-24 px-4 pt-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Success Toast Notification */}
      {successMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
           <div className="bg-green-600 text-white px-6 py-2.5 rounded-full shadow-lg flex items-center gap-2">
              <CheckCircle size={16} />
              <span className="text-xs font-bold">{successMessage}</span>
           </div>
        </div>
      )}

      {/* Header Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 p-4 rounded-xl border border-blue-100 dark:border-slate-700 mb-2 transition-colors duration-300">
         <h2 className="text-darkBlue dark:text-white font-bold text-lg">Tu Salud en Cifras</h2>
         <p className="text-xs text-textMedium dark:text-slate-400 leading-relaxed mt-1">
            El monitoreo constante de biomarcadores es clave para detectar el envejecimiento acelerado.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {renderMetricCard(
            "Peso Corporal", 
            'WEIGHT', 
            <Scale size={18} />, 
            "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", 
            "kg",
            COLORS.AccentGreen
         )}
         
         {renderMetricCard(
            "Presión Arterial", 
            'BLOOD_PRESSURE', 
            <Activity size={18} />, 
            "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", 
            "mmHg",
            COLORS.AccentRed
         )}

         {renderMetricCard(
            "Glucosa", 
            'GLUCOSE', 
            <Droplet size={18} />, 
            "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", 
            "mg/dL",
            COLORS.PrimaryBlue
         )}

         {renderMetricCard(
            "Ritmo Cardíaco", 
            'HEART_RATE', 
            <Heart size={18} />, 
            "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400", 
            "bpm",
            COLORS.AccentOrange
         )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-30">
        <button 
           onClick={() => setIsModalOpen(true)}
           className="w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-darkBlue transition-colors transform hover:scale-105"
        >
            <Plus size={28} />
        </button>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 border border-transparent dark:border-slate-700 max-h-[90vh] overflow-y-auto no-scrollbar">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-xl text-darkBlue dark:text-white">Nuevo Registro</h3>
                   <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="p-1 bg-gray-100 dark:bg-slate-700 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                       <X size={20} className="text-gray-500 dark:text-slate-400" />
                   </button>
               </div>

               <form onSubmit={handleSubmit} className="space-y-5">
                   {/* Type Selector */}
                   <div className="space-y-2">
                       <label className="text-xs font-bold text-textMedium dark:text-slate-400 uppercase tracking-wider">Tipo de Medición</label>
                       <div className="grid grid-cols-2 gap-2">
                           {[
                               { id: 'WEIGHT', label: 'Peso', icon: <Scale size={16} /> },
                               { id: 'BLOOD_PRESSURE', label: 'Presión', icon: <Activity size={16} /> },
                               { id: 'GLUCOSE', label: 'Glucosa', icon: <Droplet size={16} /> },
                               { id: 'HEART_RATE', label: 'Pulso', icon: <Heart size={16} /> }
                           ].map(opt => (
                               <div 
                                  key={opt.id}
                                  onClick={() => !isSubmitting && handleTypeChange(opt.id as BiometricType)}
                                  className={`p-3 rounded-xl border text-center text-sm font-medium cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                                      newType === opt.id 
                                      ? 'bg-blue-50 dark:bg-blue-900/30 border-primary text-primary shadow-sm' 
                                      : 'border-gray-200 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                               >
                                   {opt.icon}
                                   <span>{opt.label}</span>
                               </div>
                           ))}
                       </div>
                   </div>

                   {/* Value Input */}
                   <div className="space-y-2">
                       <label className="text-xs font-bold text-textMedium dark:text-slate-400 uppercase tracking-wider">
                           Valor {newType === 'WEIGHT' && '(kg)'} {newType === 'GLUCOSE' && '(mg/dL)'} {newType === 'HEART_RATE' && '(bpm)'}
                       </label>
                       <input 
                           type={newType === 'BLOOD_PRESSURE' ? 'text' : 'number'}
                           inputMode={newType === 'BLOOD_PRESSURE' ? 'text' : 'decimal'}
                           step="any"
                           value={newValue}
                           disabled={isSubmitting}
                           onChange={(e) => {
                             setNewValue(e.target.value);
                             if (validationError) setValidationError(null);
                           }}
                           placeholder={newType === 'BLOOD_PRESSURE' ? "Ej: 120/80" : "0.0"}
                           className={`w-full text-2xl font-bold p-4 bg-gray-50 dark:bg-slate-700 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-darkBlue dark:text-white transition-all disabled:opacity-50 ${
                             validationError ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 dark:border-slate-600'
                           }`}
                           autoFocus
                       />
                       {validationError ? (
                         <p className="text-[10px] text-red-500 font-semibold pl-1 animate-in fade-in slide-in-from-top-1">
                           {validationError}
                         </p>
                       ) : (
                         newType === 'BLOOD_PRESSURE' && <p className="text-[10px] text-gray-400 dark:text-slate-500 pl-1">Formato: Sistólica/Diastólica</p>
                       )}
                   </div>

                   {/* Date & Time Inputs */}
                   <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                           <label className="text-[10px] font-bold text-textMedium dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                               <Calendar size={12} /> Fecha
                           </label>
                           <input 
                               type="date"
                               value={recordDate}
                               disabled={isSubmitting}
                               onChange={(e) => setRecordDate(e.target.value)}
                               className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-darkBlue dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                           />
                       </div>
                       <div className="space-y-1">
                           <label className="text-[10px] font-bold text-textMedium dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                               <Clock size={12} /> Hora
                           </label>
                           <input 
                               type="time"
                               value={recordTime}
                               disabled={isSubmitting}
                               onChange={(e) => setRecordTime(e.target.value)}
                               className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-darkBlue dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                           />
                       </div>
                   </div>

                   <button 
                       type="submit"
                       disabled={!newValue || isSubmitting}
                       className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-md hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
                   >
                       {isSubmitting ? (
                         <>
                           <Loader2 size={20} className="animate-spin" />
                           <span>Guardando...</span>
                         </>
                       ) : (
                         'Guardar Registro'
                       )}
                   </button>
               </form>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-800 w-full max-sm rounded-2xl p-6 shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 border border-transparent dark:border-slate-700">
              <div className="flex flex-col items-center text-center mb-6">
                 <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4 shadow-sm">
                   <AlertCircle size={32} className="text-red-500" />
                 </div>
                 <h3 className="text-lg font-bold text-darkBlue dark:text-white">¿Eliminar Registro?</h3>
                 <p className="text-sm text-textMedium dark:text-slate-400 mt-2 leading-relaxed">
                    Estás a punto de eliminar el último registro de <strong>{deleteConfirm.type}</strong>. Esta acción no se puede deshacer.
                 </p>
              </div>
              
              <div className="flex gap-3">
                 <button 
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-slate-600 text-textMedium dark:text-slate-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                 >
                    Cancelar
                 </button>
                 <button 
                    onClick={handleConfirmDelete}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold shadow-md hover:bg-red-600 active:scale-95 transition-all"
                 >
                    Eliminar
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default BiometricsView;

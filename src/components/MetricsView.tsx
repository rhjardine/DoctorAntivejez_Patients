
import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { TrendingDown, Activity, Award, Calendar, Loader2, Info } from 'lucide-react';
import { fetchMetrics } from '../services/patientDataService';
import { ProgressMetric, COLORS } from '../types';

interface MetricsViewProps {
  onInfoPress?: () => void;
}

const MetricsView: React.FC<MetricsViewProps> = ({ onInfoPress }) => {
  const [adherenceData, setAdherenceData] = useState<ProgressMetric[]>([]);
  const [bioAgeData, setBioAgeData] = useState<ProgressMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [adh, bio] = await Promise.all([
          fetchMetrics('ADHERENCE'),
          fetchMetrics('BIO_AGE')
        ]);
        setAdherenceData(adh);
        setBioAgeData(bio);
      } catch (err) {
        console.error("Error loading metrics", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-primary">
        <Loader2 size={48} className="animate-spin" />
        <p className="mt-4 font-bold uppercase text-[10px] tracking-[0.2em]">Analizando Evolución...</p>
      </div>
    );
  }

  const latestAdherence = adherenceData.length > 0 ? adherenceData[adherenceData.length - 1].value : 0;
  const currentBioAge = bioAgeData.length > 0 ? bioAgeData[bioAgeData.length - 1].value : 0;

  return (
    <div className="flex flex-col gap-6 px-4 py-6 pb-32 overflow-y-auto no-scrollbar animate-in fade-in duration-500">
      
      {/* KPI Section */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
          <button 
            onClick={onInfoPress}
            className="absolute top-4 right-4 text-slate-200 group-hover:text-primary transition-colors"
          >
            <Info size={14} />
          </button>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black text-textMedium uppercase">Cumplimiento</span>
            <Activity size={18} className="text-primary" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-darkBlue">{latestAdherence}%</span>
          </div>
          <p className="text-[10px] font-bold text-accentGreen mt-1">+5% vs mes anterior</p>
        </div>

        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
          <button 
            onClick={onInfoPress}
            className="absolute top-4 right-4 text-slate-200 group-hover:text-primary transition-colors"
          >
            <Info size={14} />
          </button>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black text-textMedium uppercase">Edad Bio</span>
            <TrendingDown size={18} className="text-accentGreen" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-darkBlue">{currentBioAge.toFixed(1)}</span>
            <span className="text-[10px] font-bold text-textMedium">años</span>
          </div>
          <p className="text-[10px] font-bold text-primary mt-1">Rejuvenecimiento activo</p>
        </div>
      </div>

      {/* Area Chart: Compliance */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2 bg-blue-50 text-primary rounded-xl"><Award size={20} /></div>
           <h3 className="text-sm font-black text-darkBlue uppercase tracking-tighter">Cumplimiento Semanal (%)</h3>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={adherenceData}>
              <defs>
                <linearGradient id="colorAdh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.PrimaryBlue} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.PrimaryBlue} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F4F8" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#8A9BB3'}} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS.PrimaryBlue} 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorAdh)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart: Biological Age */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2 bg-green-50 text-accentGreen rounded-xl"><Calendar size={20} /></div>
           <h3 className="text-sm font-black text-darkBlue uppercase tracking-tighter">Evolución Edad Biológica</h3>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bioAgeData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F4F8" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#8A9BB3'}} />
              <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={COLORS.AccentGreen} 
                strokeWidth={4}
                dot={{ r: 6, fill: COLORS.AccentGreen, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default MetricsView;

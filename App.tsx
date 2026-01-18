
import React, { useState, useEffect } from 'react';
import { 
  Shield, Trophy, RefreshCw, Menu, ChevronLeft, LayoutDashboard, 
  BarChart3, ClipboardList, MessageCircle, Store, User, LogOut,
  ChevronRight, Apple, Utensils, Coffee, Salad, Grape,
  Zap, Activity, Dumbbell, Bike,
  Smile, Brain, Heart, Sparkles, Star,
  Sprout, Leaf, Home, CloudSun, Wind,
  Bed, Moon, Clock, Bell, Check,
  Flame, Trash2, Dna, Info, Lock, ShoppingBag,
  ClipboardCheck
} from 'lucide-react';
import { COLORS, MainTab, DetailView, PatientProtocol, UserSession, UserPreferences } from './types';
import { authService } from './services/authService';
import { ProtocolService } from './services/protocolService';
import { fetchMetrics, toggleGuideItemCompletion } from './services/patientDataService';
import { useReminders } from './hooks/useReminders';

// Components
import LoginView from './components/LoginView';
import BiologicalAgeGauge from './components/BiologicalAgeGauge';
import BioAgeAlert from './components/BioAgeAlert';
import CircularProgress from './components/CircularProgress';
import PatientGuideView from './components/PatientGuideView';
import MetricsView from './components/MetricsView';
import VCoachChat from './components/VCoachChat';
import Drawer from './components/Drawer';
import AchievementsView from './components/AchievementsView';
import NutritionView from './components/NutritionView';
import AttitudeView from './components/AttitudeView';
import ActivityView from './components/ActivityView';
import EnvironmentView from './components/EnvironmentView';
import RestView from './components/RestView';
import AboutView from './components/AboutView';
import MedicalTeamView from './components/MedicalTeamView';
import UsageGuideView from './components/UsageGuideView';
import BiometricsView from './components/BiometricsView';
import ConsultationHistoryView from './components/ConsultationHistoryView';
import BioPaseView from './components/BioPaseView';
import ClinicalInfoModal from './components/ClinicalInfoModal';
import PrivacyConsentModal from './components/PrivacyConsentModal';
import SettingsView from './components/SettingsView';

const DEFAULT_PREFERENCES: UserPreferences = {
  icons: {
    NUTRITION: 'Apple',
    ACTIVITY: 'Zap',
    ATTITUDE: 'Smile',
    ENVIRONMENT: 'Sprout',
    REST: 'Bed'
  }
};

const ICON_MAP: Record<string, any> = {
  Apple, Utensils, Coffee, Salad, Grape,
  Zap, Activity, Dumbbell, Trophy, Bike,
  Smile, Brain, Heart, Sparkles, Star,
  Sprout, Leaf, Home, CloudSun, Wind,
  Bed, Moon, Clock, Bell, Check
};

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(authService.getCurrentUser());
  const [activeView, setActiveView] = useState<'LOGROS' | 'HOME' | 'METRICS' | 'GUIDE' | 'CHAT' | 'STORE'>('HOME');
  const [detailView, setDetailView] = useState<DetailView>(null);
  const [currentMainTab, setCurrentMainTab] = useState<MainTab>(MainTab.KEYS_5A);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isClinicalInfoOpen, setIsClinicalInfoOpen] = useState(false);
  const [isPrivacyConsentOpen, setIsPrivacyConsentOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [isGuideLoading, setIsGuideLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  
  const [biophysicalAge, setBiophysicalAge] = useState<number>(65); 
  const [chronologicalAge, setChronologicalAge] = useState<number>(58);
  
  const [patientGuideItems, setPatientGuideItems] = useState<PatientProtocol[]>([]);
  
  const notificationControls = useReminders(patientGuideItems);

  useEffect(() => {
    if (session) {
      const consentKey = `rejuvenate_consent_${session.id}`;
      const consented = localStorage.getItem(consentKey) === 'true';
      setHasConsented(consented);
      if (!consented) {
        setIsPrivacyConsentOpen(true);
      }
      
      const prefsKey = `rejuvenate_prefs_${session.id}`;
      const storedPrefs = localStorage.getItem(prefsKey);
      if (storedPrefs) {
        try { setUserPreferences(JSON.parse(storedPrefs)); } catch (e) {}
      }
      
      loadInitialData();
    }
  }, [session]);

  const loadInitialData = async () => {
    if (!session) return;
    setIsGuideLoading(true);
    try {
      const items = await ProtocolService.fetchActiveProtocol(session.id);
      setPatientGuideItems(items);
    } catch (err) {
      console.error("Data load error", err);
    } finally {
      setTimeout(() => setIsGuideLoading(false), 800);
    }
  };

  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setUserPreferences(newPrefs);
    if (session) {
      localStorage.setItem(`rejuvenate_prefs_${session.id}`, JSON.stringify(newPrefs));
    }
  };

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    setActiveView('HOME');
  };

  const handleLogout = () => {
    authService.logout();
    setSession(null);
    setIsDrawerOpen(false);
  };

  const handleAcceptPrivacy = () => {
    if (session) {
      const consentKey = `rejuvenate_consent_${session.id}`;
      localStorage.setItem(consentKey, 'true');
      setHasConsented(true);
      setIsPrivacyConsentOpen(false);
    }
  };

  if (!session) {
    return <LoginView onLoginSuccess={handleLogin} />;
  }

  const getIcon = (category: keyof UserPreferences['icons']) => {
    const iconId = userPreferences.icons[category];
    const IconComponent = ICON_MAP[iconId] || ICON_MAP[DEFAULT_PREFERENCES.icons[category]];
    return <IconComponent size={20} />;
  };

  const completedCount = patientGuideItems.filter(i => i.status === 'completed').length;
  const totalCount = patientGuideItems.length;
  const adherence = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const renderDashboardMatrix = () => {
    const is5A = currentMainTab === MainTab.KEYS_5A;
    
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-0 mt-2 w-full px-4 relative pb-10">
        {is5A ? (
          <>
            <div onClick={() => setDetailView('NUTRITION')} className="cursor-pointer flex justify-center transition-transform active:scale-95"><CircularProgress percentage={75} label="Alimentación" icon={getIcon('NUTRITION')} color={COLORS.PrimaryBlue} size={90} /></div>
            <div onClick={() => setDetailView('ACTIVITY')} className="cursor-pointer flex justify-center transition-transform active:scale-95"><CircularProgress percentage={40} label="Actividad" icon={getIcon('ACTIVITY')} color={COLORS.PrimaryBlue} size={90} /></div>
          </>
        ) : (
          <>
            <div onClick={() => setDetailView('ABOUT')} className="cursor-pointer flex justify-center transition-transform active:scale-95"><CircularProgress percentage={25} label="Remoción" icon={<Trash2 size={20} />} color={COLORS.PrimaryBlue} size={90} /></div>
            <div onClick={() => setDetailView('ABOUT')} className="cursor-pointer flex justify-center transition-transform active:scale-95"><CircularProgress percentage={35} label="Restauración" icon={<RefreshCw size={20} />} color={COLORS.PrimaryBlue} size={90} /></div>
          </>
        )}
        
        <div className="col-span-2 flex justify-center -my-6 z-10">
          <button onClick={() => setActiveView('CHAT')} className="active:scale-90 transition-transform">
            <CircularProgress percentage={adherence} label="Mi VCoach" icon={<MessageCircle size={30} />} color={COLORS.DarkBlue} isCenter={true} size={110} />
          </button>
        </div>

        {is5A ? (
          <>
            <div onClick={() => setDetailView('ATTITUDE')} className="cursor-pointer flex justify-center mt-8 transition-transform active:scale-95"><CircularProgress percentage={60} label="Actitud" icon={getIcon('ATTITUDE')} color={COLORS.PrimaryBlue} size={85} /></div>
            <div onClick={() => setDetailView('ENVIRONMENT')} className="cursor-pointer flex justify-center mt-8 transition-transform active:scale-95"><CircularProgress percentage={30} label="Entorno" icon={getIcon('ENVIRONMENT')} color={COLORS.PrimaryBlue} size={85} /></div>
          </>
        ) : (
          <>
            <div onClick={() => setDetailView('ABOUT')} className="cursor-pointer flex justify-center mt-8 transition-transform active:scale-95"><CircularProgress percentage={40} label="Regeneración" icon={<Activity size={20} />} color={COLORS.PrimaryBlue} size={85} /></div>
            <div onClick={() => setDetailView('ABOUT')} className="cursor-pointer flex justify-center mt-8 transition-transform active:scale-95"><CircularProgress percentage={60} label="Revitalización" icon={<Flame size={20} />} color={COLORS.PrimaryBlue} size={85} /></div>
          </>
        )}
      </div>
    );
  };

  const renderHomeContent = () => {
    return (
      <div className="flex flex-col w-full animate-in fade-in duration-500 overflow-y-auto no-scrollbar pb-32">
        <BiologicalAgeGauge 
          biologicalAge={biophysicalAge} 
          chronologicalAge={chronologicalAge}
          completedItems={completedCount}
          totalItems={totalCount}
          onInfoPress={() => setIsClinicalInfoOpen(true)}
        />
        
        <div className="w-full">
          {currentMainTab === MainTab.CHALLENGE ? (
             <div className="flex flex-col items-center w-full px-6 py-4 animate-in fade-in duration-300">
               <div className="w-full bg-white/70 backdrop-blur-sm rounded-3xl p-4 mb-6 border border-white/50 text-center shadow-sm">
                 <p className="text-[11px] font-bold text-darkBlue italic">"La consistencia es la clave de la regeneración celular."</p>
               </div>
               <div onClick={() => setDetailView('PATIENT_GUIDE')} className="w-full bg-white rounded-[2rem] p-5 shadow-md border border-sky-50 mb-6 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all">
                 <div className="flex items-center gap-4">
                   <div className="bg-sky-50 p-3.5 rounded-2xl text-primary"><ClipboardCheck size={28} /></div>
                   <div>
                     <h3 className="font-black text-darkBlue text-lg">Guía del Paciente</h3>
                     <p className="text-[10px] font-bold text-textMedium uppercase">Misión Diaria</p>
                   </div>
                 </div>
                 <div className="bg-red-50 text-accentRed text-[9px] font-black px-3 py-2 rounded-xl uppercase tracking-tighter">
                    {totalCount - completedCount} Pendientes
                 </div>
               </div>
               <div className="w-full bg-white rounded-[2rem] p-5 shadow-sm border border-gray-50 mb-6">
                   <div className="flex justify-between items-center mb-3">
                       <span className="text-xs font-black text-darkBlue uppercase">Progreso Hoy</span>
                       <span className="text-xs font-black text-primary">{adherence}%</span>
                   </div>
                   <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                       <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${adherence}%` }}></div>
                   </div>
               </div>
             </div>
          ) : (
            <>
              {renderDashboardMatrix()}
              
              {/* Alert now placed AFTER the longevity keys matrix */}
              <BioAgeAlert 
                bioAge={biophysicalAge} 
                chronoAge={chronologicalAge} 
                onAction={() => setDetailView('PATIENT_GUIDE')} 
              />

              <div 
                onClick={() => setDetailView('PATIENT_GUIDE')}
                className="mx-6 mb-6 mt-6 bg-white rounded-[2rem] p-5 shadow-md border border-sky-50 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-sky-50 p-3.5 rounded-2xl text-primary"><ClipboardList size={28} /></div>
                  <div>
                    <h3 className="font-black text-darkBlue text-base leading-tight">Continuar Plan</h3>
                    <p className="text-[10px] font-bold text-textMedium uppercase tracking-tighter">{totalCount - completedCount} tareas pendientes</p>
                  </div>
                </div>
                <ChevronRight className="text-slate-300" size={20} />
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderActiveContent = () => {
    if (!hasConsented && (detailView === 'PATIENT_GUIDE' || detailView === 'CONSULTATION_HISTORY' || detailView === 'BIOMETRICS' || detailView === 'BIO_PASE' || activeView === 'GUIDE' || activeView === 'METRICS')) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in">
           <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mb-6">
              <Lock size={28} />
           </div>
           <h3 className="text-lg font-black text-darkBlue uppercase tracking-tighter mb-4">Acceso Restringido</h3>
           <button 
             onClick={() => setIsPrivacyConsentOpen(true)}
             className="bg-darkBlue text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-all"
           >
             Ver Consentimiento
           </button>
        </div>
      );
    }

    if (detailView) {
      switch (detailView) {
        case 'NUTRITION': return <NutritionView />;
        case 'ATTITUDE': return <AttitudeView />;
        case 'ACTIVITY': return <ActivityView />;
        case 'ENVIRONMENT': return <EnvironmentView />;
        case 'REST': return <RestView />;
        case 'ABOUT': return <AboutView onNavigateToTeam={() => setDetailView('TEAM')} onNavigateToGuide={() => setDetailView('USAGE_GUIDE')} />;
        case 'TEAM': return <MedicalTeamView />;
        case 'USAGE_GUIDE': return <UsageGuideView />;
        case 'SETTINGS': return <SettingsView preferences={userPreferences} onUpdatePreferences={handleUpdatePreferences} />;
        case 'PATIENT_GUIDE': return (
          <PatientGuideView 
            items={patientGuideItems} 
            loading={isGuideLoading}
            onInfoPress={() => setIsClinicalInfoOpen(true)}
            onToggleItem={async (id) => {
              const item = patientGuideItems.find(i => i.id === id);
              if (!item) return;
              const newStatus = item.status === 'completed' ? 'pending' : 'completed';
              const newItems = patientGuideItems.map(i => i.id === id ? { ...i, status: newStatus as 'pending' | 'completed' } : i);
              setPatientGuideItems(newItems);
              await ProtocolService.updateItemStatus(session.id, id, newStatus as 'pending' | 'completed');
            }} 
            onRefresh={loadInitialData}
          />
        );
        case 'BIOMETRICS': return (
           <BiometricsView 
              entries={[]} 
              onAdd={() => {}} 
              onDelete={() => {}} 
           />
        );
        case 'CONSULTATION_HISTORY': return <ConsultationHistoryView onBack={() => setDetailView(null)} onInfoPress={() => setIsClinicalInfoOpen(true)} />;
        case 'BIO_PASE': return <BioPaseView patientId={session.id} onRefresh={loadInitialData} onBack={() => setDetailView(null)} />;
        default: return renderHomeContent();
      }
    }

    switch (activeView) {
      case 'HOME': return renderHomeContent();
      case 'METRICS': return <MetricsView onInfoPress={() => setIsClinicalInfoOpen(true)} />;
      case 'GUIDE': return (
        <PatientGuideView 
          items={patientGuideItems} 
          loading={isGuideLoading}
          onInfoPress={() => setIsClinicalInfoOpen(true)}
          onToggleItem={async (id) => {
            const item = patientGuideItems.find(i => i.id === id);
            if (!item) return;
            const newStatus = item.status === 'completed' ? 'pending' : 'completed';
            const newItems = patientGuideItems.map(i => i.id === id ? { ...i, status: newStatus as 'pending' | 'completed' } : i);
            setPatientGuideItems(newItems);
            await ProtocolService.updateItemStatus(session.id, id, newStatus as 'pending' | 'completed');
          }} 
          onRefresh={loadInitialData}
        />
      );
      case 'LOGROS': return <AchievementsView />;
      case 'CHAT': return <VCoachChat />;
      case 'STORE': return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-primary mb-6">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-xl font-black text-darkBlue uppercase tracking-tighter mb-4">Bio-Tienda Rejuvenate</h2>
          <p className="text-sm font-bold text-textMedium leading-relaxed max-w-xs">
            Próximamente: Accede a nutracéuticos de grado clínico y fórmulas exclusivas del Doctor Antivejez.
          </p>
        </div>
      );
      default: return renderHomeContent();
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onNavigate={(view) => {
            setDetailView(view);
            setActiveView('HOME');
        }}
        notificationControls={notificationControls} 
      />
      <ClinicalInfoModal isOpen={isClinicalInfoOpen} onClose={() => setIsClinicalInfoOpen(false)} />
      <PrivacyConsentModal isOpen={isPrivacyConsentOpen} onAccept={handleAcceptPrivacy} />

      <header className="bg-darkBlue text-white pt-safe-top z-30 shadow-sm shrink-0">
        <div className="flex items-center justify-between px-6 py-3.5">
          {detailView ? (
            <button onClick={() => setDetailView(null)} className="p-1"><ChevronLeft size={28} /></button>
          ) : (
            <button onClick={() => setIsDrawerOpen(true)} className="p-1"><Menu size={28} /></button>
          )}
          <div className="flex items-center gap-2">
             <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                <Dna size={18} className="text-primary" />
             </div>
             <div className="flex flex-col">
               <h1 className="text-[10px] font-black tracking-widest uppercase leading-none">Doctor</h1>
               <h1 className="text-sm font-black text-primary tracking-tighter uppercase leading-none">Antivejez</h1>
             </div>
          </div>
          <button onClick={handleLogout} className="p-1 text-white/20 hover:text-white transition-colors"><LogOut size={20} /></button>
        </div>

        {activeView === 'HOME' && !detailView && (
           <div className="flex bg-primary">
              <button onClick={() => setCurrentMainTab(MainTab.KEYS_5A)} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border-b-[3px] ${currentMainTab === MainTab.KEYS_5A ? 'border-white text-white' : 'border-transparent text-white/50'}`}>
                <Shield size={12} /> Claves 5A
              </button>
              <button onClick={() => setCurrentMainTab(MainTab.THERAPIES_4R)} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border-b-[3px] ${currentMainTab === MainTab.THERAPIES_4R ? 'border-white text-white' : 'border-transparent text-white/50'}`}>
                <RefreshCw size={12} /> Terapias 4R
              </button>
              <button onClick={() => setCurrentMainTab(MainTab.CHALLENGE)} className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border-b-[3px] ${currentMainTab === MainTab.CHALLENGE ? 'border-white text-white' : 'border-transparent text-white/50'}`}>
                <Trophy size={12} /> Reto
              </button>
           </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar relative bg-[#F8FAFC]">
        {renderActiveContent()}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-darkBlue border-t border-white/5 pb-safe-bottom shrink-0">
        <div className="flex justify-around items-center py-3.5 px-4">
          <button 
            onClick={() => { setActiveView('HOME'); setDetailView(null); }} 
            className={`flex flex-col items-center gap-1 transition-all ${activeView === 'HOME' && !detailView ? 'text-white scale-110' : 'text-white/40'}`}
          >
            <LayoutDashboard size={24} strokeWidth={activeView === 'HOME' && !detailView ? 2.5 : 2} />
            <span className="text-[9px] font-black uppercase tracking-widest">Inicio</span>
          </button>
          
          <button 
            onClick={() => { setActiveView('LOGROS'); setDetailView(null); }} 
            className={`flex flex-col items-center gap-1 transition-all ${activeView === 'LOGROS' ? 'text-white scale-110' : 'text-white/40'}`}
          >
            <Trophy size={24} strokeWidth={activeView === 'LOGROS' ? 2.5 : 2} />
            <span className="text-[9px] font-black uppercase tracking-widest">Logros</span>
          </button>

          <button 
            onClick={() => { setActiveView('STORE'); setDetailView(null); }} 
            className={`flex flex-col items-center gap-1 transition-all ${activeView === 'STORE' ? 'text-white scale-110' : 'text-white/40'}`}
          >
            <Store size={24} strokeWidth={activeView === 'STORE' ? 2.5 : 2} />
            <span className="text-[9px] font-black uppercase tracking-widest">Tienda</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;

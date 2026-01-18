
import React, { useState } from 'react';
import { X, Settings, Info, LogOut, User, AlertCircle, Activity, Bell, BellOff, Zap, FileClock, QrCode } from 'lucide-react';
import { COLORS, DetailView } from '../types';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: DetailView) => void;
  notificationControls: {
    notificationsEnabled: boolean;
    enableNotifications: () => void;
    disableNotifications: () => void;
    sendTestNotification: () => void;
    permission: NotificationPermission;
  };
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, onNavigate, notificationControls }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { notificationsEnabled, enableNotifications, disableNotifications, sendTestNotification, permission } = notificationControls;

  const handleNavigation = (view: DetailView) => {
    onNavigate(view);
    onClose();
  };

  const toggleNotifications = () => {
    if (notificationsEnabled) {
      disableNotifications();
    } else {
      enableNotifications();
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-darkBlue/60 backdrop-blur-[4px] z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div 
        className={`fixed top-0 left-0 h-full w-[300px] bg-white z-50 shadow-2xl transform transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="bg-darkBlue p-8 pt-16 text-white relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white"><X size={32} /></button>
          <div className="flex flex-col gap-4">
            <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center text-white shadow-xl border-4 border-white/10">
               <User size={40} />
            </div>
            <div>
              <h2 className="font-black text-2xl leading-none tracking-tighter">Rhys Jardine</h2>
              <p className="text-sm text-primary font-bold mt-1">Nivel: Bio-Hacker</p>
            </div>
          </div>
        </div>

        <div className="py-6 flex flex-col h-full overflow-y-auto no-scrollbar">
          
          <button 
             onClick={() => handleNavigation('BIOMETRICS')}
             className="w-full flex items-center gap-5 px-8 py-5 hover:bg-pearlyGray transition-all text-darkBlue group"
          >
             <Activity size={24} className="text-textMedium group-hover:text-primary" />
             <span className="font-black text-base uppercase tracking-widest">Mis Biométricos</span>
          </button>

          <button 
             onClick={() => handleNavigation('CONSULTATION_HISTORY')}
             className="w-full flex items-center gap-5 px-8 py-5 hover:bg-pearlyGray transition-all text-darkBlue group"
          >
             <FileClock size={24} className="text-textMedium group-hover:text-primary" />
             <span className="font-black text-base uppercase tracking-widest">Historial Médico</span>
          </button>

          <button 
             onClick={() => handleNavigation('BIO_PASE')}
             className="w-full flex items-center gap-5 px-8 py-5 hover:bg-pearlyGray transition-all text-darkBlue group"
          >
             <QrCode size={24} className="text-textMedium group-hover:text-primary" />
             <span className="font-black text-base uppercase tracking-widest">Bio-Pase (Check-in)</span>
          </button>

          <button 
             onClick={() => handleNavigation('SETTINGS')}
             className="w-full flex items-center gap-5 px-8 py-5 hover:bg-pearlyGray transition-all text-darkBlue group"
          >
             <Settings size={24} className="text-textMedium group-hover:text-primary" />
             <span className="font-black text-base uppercase tracking-widest">Personalización</span>
          </button>

          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <Bell size={24} className={notificationsEnabled ? 'text-primary' : 'text-textMedium'} />
                  <span className="font-black text-base text-darkBlue uppercase tracking-widest">Avisos</span>
                </div>
                <div 
                  onClick={toggleNotifications}
                  className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 mx-8 my-4"></div>

          <button onClick={() => handleNavigation('ABOUT')} className="w-full flex items-center gap-5 px-8 py-5 hover:bg-pearlyGray transition-all text-darkBlue group">
             <Info size={24} className="text-textMedium group-hover:text-primary" />
             <span className="font-black text-base uppercase tracking-widest">Sobre la App</span>
          </button>
          
          <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center gap-5 px-8 py-5 hover:bg-red-50 transition-all text-accentRed group">
             <LogOut size={24} className="group-hover:text-red-600" />
             <span className="font-black text-base uppercase tracking-widest">Cerrar Sesión</span>
          </button>
          
          <div className="mt-auto mb-10 px-8 text-center">
            <p className="text-[10px] font-black text-gray-300 tracking-[0.3em] uppercase">Rejuvenate v2.0</p>
          </div>

          {showLogoutConfirm && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 animate-in fade-in">
               <div className="flex flex-col items-center text-center">
                  <div className="bg-red-50 p-6 rounded-[2rem] mb-6">
                    <AlertCircle size={48} className="text-accentRed" />
                  </div>
                  <h3 className="text-2xl font-black text-darkBlue uppercase tracking-tighter">¿Cerrar Sesión?</h3>
                  <p className="text-sm text-textMedium mt-3 font-bold">Perderás la conexión con tu doctor hasta que vuelvas a ingresar.</p>
                  
                  <div className="flex flex-col w-full gap-3 mt-8">
                     <button onClick={() => setShowLogoutConfirm(false)} className="py-4 rounded-2xl bg-darkBlue text-white text-sm font-black uppercase tracking-widest">Volver</button>
                     <button onClick={() => setShowLogoutConfirm(false)} className="py-4 rounded-2xl border-2 border-accentRed text-accentRed text-sm font-black uppercase tracking-widest">Salir</button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Drawer;

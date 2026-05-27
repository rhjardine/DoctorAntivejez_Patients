
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Info, LogOut, User, AlertCircle, Activity, Bell, Zap, FileClock, QrCode, Settings, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { useLocale } from '../hooks/useLocale';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notificationControls: {
    notificationsEnabled: boolean;
    enableNotifications: () => void;
    disableNotifications: () => void;
    sendTestNotification: () => void;
    permission: NotificationPermission;
  };
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, notificationControls }) => {
  const navigate = useNavigate();
  const { logout, session } = useAuthStore();
  const { notificationsEnabled, enableNotifications, disableNotifications } = notificationControls;
  const { t } = useLocale();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
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
        className={`fixed inset-0 bg-darkBlue/60 backdrop-blur-[4px] z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      <div
        className={`fixed top-0 left-0 h-full w-[300px] flex flex-col bg-white z-50 shadow-2xl transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="bg-darkBlue p-6 pt-14 text-white relative overflow-hidden shrink-0">
          {/* Decorative background circles */}
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-primary/10 pointer-events-none" />
          <div className="absolute top-10 -right-2 w-14 h-14 rounded-full bg-primary/15 pointer-events-none" />

          <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white z-10"><X size={28} /></button>

          {/* Welcome card */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white shadow-xl border-2 border-white/10 shrink-0">
              <User size={32} />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/80">Bienvenido</span>
              <h2 className="font-black text-lg leading-tight tracking-tight truncate max-w-[185px] text-white">
                {session?.name || 'Paciente'}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Sesión activa</span>
              </div>
            </div>
          </div>

          {/* Decorative motivational strip */}
          <div className="mt-4 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
            <p className="text-[10px] font-bold text-white/60 italic leading-snug">
              "Cada día es una oportunidad para rejuvenecer a nivel celular."
            </p>
          </div>
        </div>

        <div className="py-6 flex flex-col flex-1 overflow-y-auto no-scrollbar">

          {/* ── FASE 2: INHABILITADAS ── */}

          {/* Mis Biométricos — Pronto */}
          <div className="flex items-center gap-4 px-6 py-4 opacity-40 grayscale cursor-not-allowed select-none">
            <Activity size={22} className="text-textMedium shrink-0" />
            <span className="font-black text-[13px] uppercase tracking-widest text-darkBlue">Mis Biométricos</span>
            <span className="ml-auto text-[9px] font-bold bg-[#14b8a6]/10 text-[#14b8a6] px-2 py-1 rounded-md uppercase tracking-wider border border-[#14b8a6]/20 whitespace-nowrap">
              Pronto
            </span>
          </div>

          {/* Historial Médico — Pronto */}
          <div className="flex items-center gap-4 px-6 py-4 opacity-40 grayscale cursor-not-allowed select-none">
            <FileClock size={22} className="text-textMedium shrink-0" />
            <span className="font-black text-[13px] uppercase tracking-widest text-darkBlue">Historial Médico</span>
            <span className="ml-auto text-[9px] font-bold bg-[#14b8a6]/10 text-[#14b8a6] px-2 py-1 rounded-md uppercase tracking-wider border border-[#14b8a6]/20 whitespace-nowrap">
              Pronto
            </span>
          </div>

          {/* Bio-Pase — Pronto */}
          <div className="flex items-center gap-4 px-6 py-4 opacity-40 grayscale cursor-not-allowed select-none">
            <QrCode size={22} className="text-textMedium shrink-0" />
            <span className="font-black text-[13px] uppercase tracking-widest text-darkBlue">Bio-Pase (Check-in)</span>
            <span className="ml-auto text-[9px] font-bold bg-[#14b8a6]/10 text-[#14b8a6] px-2 py-1 rounded-md uppercase tracking-wider border border-[#14b8a6]/20 whitespace-nowrap">
              Pronto
            </span>
          </div>

          {/* ── Notificaciones (Toggle activo) ── */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Bell size={22} className={notificationsEnabled ? 'text-primary' : 'text-textMedium'} />
                <span className="font-black text-[13px] text-darkBlue uppercase tracking-widest">Avisos</span>
              </div>
              <div
                onClick={toggleNotifications}
                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-gray-300'}`}
              >
                <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </div>
            </div>
          </div>

          {/* Configuración — Pronto */}
          <div className="flex items-center gap-4 px-6 py-4 opacity-40 grayscale cursor-not-allowed select-none">
            <Settings size={22} className="text-textMedium shrink-0" />
            <span className="font-black text-[13px] uppercase tracking-widest text-darkBlue">Configuración</span>
            <span className="ml-auto text-[9px] font-bold bg-[#14b8a6]/10 text-[#14b8a6] px-2 py-1 rounded-md uppercase tracking-wider border border-[#14b8a6]/20 whitespace-nowrap">
              Pronto
            </span>
          </div>

          <div className="h-px bg-gray-100 mx-6 my-3"></div>

          {/* Sobre la App — Pronto */}
          <div className="flex items-center gap-4 px-6 py-4 opacity-40 grayscale cursor-not-allowed select-none">
            <Info size={22} className="text-textMedium shrink-0" />
            <span className="font-black text-[13px] uppercase tracking-widest text-darkBlue">Sobre la App</span>
            <span className="ml-auto text-[9px] font-bold bg-[#14b8a6]/10 text-[#14b8a6] px-2 py-1 rounded-md uppercase tracking-wider border border-[#14b8a6]/20 whitespace-nowrap">
              Pronto
            </span>
          </div>

          {/* Reportar Problema (activo — canal de soporte) */}
          <a
            href={`mailto:soporte@doctorantivejez.com?subject=Reporte%20de%20Error%20PWA&body=Paciente%3A%20${encodeURIComponent(session?.name || '')}%0AFecha%3A%20${encodeURIComponent(new Date().toLocaleString('es-VE'))}%0A%0ADescripci%C3%B3n%20del%20problema%3A%0A`}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-amber-50 transition-all text-amber-600 group"
          >
            <MessageSquare size={22} className="text-amber-400 group-hover:text-amber-600" />
            <span className="font-black text-[13px] uppercase tracking-widest">
              Reportar Problema
            </span>
          </a>

          <div className="mt-auto mb-4 px-8 text-center">
            <p className="text-[10px] font-black text-gray-300 tracking-[0.3em] uppercase">Rejuvenate v2.0</p>
          </div>

          {/* Botón de Logout con Confirmación Estilizada */}
          <div className="p-4 border-t border-slate-100 mt-auto">
            {!showLogoutConfirm ? (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold"
              >
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
              </button>
            ) : (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100 transition-all animate-in fade-in slide-in-from-bottom-2">
                <p className="text-xs text-red-800 font-medium mb-3 text-center">¿Seguro que deseas salir?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    Volver
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      onClose();
                      setShowLogoutConfirm(false);
                    }}
                    className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Drawer;


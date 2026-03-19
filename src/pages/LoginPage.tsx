import React, { useState } from 'react';
import { Fingerprint, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { authService } from '../services/authService';
import { useLocale } from '../hooks/useLocale';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading } = useAuthStore();
    const [documentId, setDocumentId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { t } = useLocale();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!documentId || !password || isLoading) return;

        setError(null);

        // Targeted cleanup
        authService.clearSession();

        try {
            await login(documentId, password);
            useUIStore.getState().setMainTab("Claves 5A" as any); // Reset to Claves 5A (MainTab.KEYS_5A)
            navigate('/');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : t('error.login'));
        }
    };

    return (
        <div
            className="flex flex-col h-screen w-full px-6
                 pt-safe-top pb-safe-bottom items-center
                 justify-center animate-in fade-in
                 duration-700 bg-[rgb(41,59,100)] overflow-y-auto"
        >
            <div className="w-full max-w-sm flex flex-col items-center">

                {/* Logo with Glow */}
                <div className="relative flex flex-col items-center mb-8 mt-12">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-400 opacity-30 rounded-full blur-3xl pointer-events-none" />
                    <img
                        src="/Logo_azul_oscuro.png"
                        alt="Doctor Antivejez"
                        className="w-48 h-auto object-contain z-10 drop-shadow-lg"
                        style={{ filter: 'brightness(1.5)' }}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>

                <h1 className="text-[22px] font-medium text-cyan-200 mb-10 z-10 text-center px-4">
                    Acceso Seguro para Pacientes
                </h1>

                {/* Form */}
                <form onSubmit={handleLogin} className="w-full space-y-6 z-10">
                    <div className="space-y-4">
                        {/* Document ID */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-cyan-200 uppercase tracking-wide ml-1">
                                DOCUMENTO DE IDENTIDAD
                            </label>
                            <input
                                type="text"
                                value={documentId}
                                onChange={(e) => setDocumentId(e.target.value)}
                                placeholder="Ej: 5963578"
                                autoComplete="username"
                                className="w-full bg-white rounded-lg p-3.5
                                         text-base font-medium text-slate-800
                                         placeholder:text-slate-400
                                         focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all shadow-sm"
                                required
                                autoFocus
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-cyan-200 uppercase tracking-wide ml-1">
                                CONTRASEÑA
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="•••••••••"
                                autoComplete="current-password"
                                className="w-full bg-white rounded-lg p-3.5
                                         text-base font-medium text-slate-800
                                         placeholder:text-slate-400
                                         focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all shadow-sm"
                                required
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 mt-2 px-2 text-red-300 animate-in slide-in-from-top-2">
                                <AlertCircle size={14} />
                                <span className="text-[11px] font-bold uppercase">{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={!documentId || !password || isLoading}
                        className="w-full text-[#0f172a] py-3.5 rounded-lg
                                 font-bold text-[17px] shadow-lg
                                 active:scale-95 transition-all
                                 flex items-center justify-center
                                 gap-2 disabled:opacity-50
                                 disabled:cursor-not-allowed
                                 disabled:scale-100"
                        style={{
                            backgroundColor: 'rgba(35, 188, 239, 1)'
                        }}
                    >
                        {isLoading ? (
                            <Loader2 size={24} className="animate-spin text-[#0f172a]" />
                        ) : (
                            <>
                                <span>Entrar</span>
                                <ArrowRight size={20} strokeWidth={2.5} />
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center justify-center gap-4 pt-2">
                        <div className="h-[1px] flex-1 bg-white/20"></div>
                        <span className="text-white/60 text-sm font-medium">o accede con</span>
                        <div className="h-[1px] flex-1 bg-white/20"></div>
                    </div>

                    {/* Biometric Button */}
                    <button
                        type="button"
                        onClick={() => alert("Autenticación biométrica no configurada.")}
                        className="w-full bg-transparent border-[1.5px] border-cyan-400 text-cyan-400 
                                 py-3.5 rounded-lg font-medium text-[17px]
                                 active:scale-95 transition-all
                                 flex items-center justify-center gap-3"
                    >
                        <Fingerprint size={22} className="text-cyan-400 opacity-90" />
                        <span>Biometría / Face ID</span>
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-12 mb-6 text-center z-10 opacity-70">
                    <p className="text-[11px] font-medium text-cyan-200">
                        Protegido con cifrado AES-256 · Dr. Juan Carlos Méndez
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
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

        // Targeted cleanup: solo limpia datos de sesión previos, no todo localStorage
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
        <div className="flex flex-col h-full w-full bg-[#23BCEF] px-8 pt-safe-top pb-safe-bottom items-center justify-center animate-in fade-in duration-700 min-h-screen">

            {/* Branding */}
            <div className="flex flex-col items-center mb-12">
                <img
                    src="/Logo_app.jpeg"
                    alt="Doctor Antivejez"
                    className="w-64 h-auto object-contain animate-in zoom-in duration-700 drop-shadow-sm"
                />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-[#293b64] uppercase tracking-widest ml-1">{t('login.documentId')}</label>
                        <input
                            type="text"
                            value={documentId}
                            onChange={(e) => setDocumentId(e.target.value)}
                            placeholder={t('login.placeholder.documentId')}
                            autoComplete="username"
                            className={`w-full bg-white border-2 rounded-3xl p-4 text-lg font-black text-black placeholder:text-slate-300 focus:outline-none transition-all ${error ? 'border-red-500 focus:border-red-600' : 'border-[#293b64] focus:border-[#293b64]/50'
                                } shadow-md`}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-[#293b64] uppercase tracking-widest ml-1">{t('login.password')}</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('login.placeholder.password')}
                            autoComplete="current-password"
                            className={`w-full bg-white border-2 rounded-3xl p-4 text-lg font-black text-black placeholder:text-slate-300 focus:outline-none transition-all ${error ? 'border-red-500 focus:border-red-600' : 'border-[#293b64] focus:border-[#293b64]/50'
                                } shadow-md`}
                            required
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 mt-2 px-2 text-red-600 animate-in slide-in-from-top-2">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-bold uppercase">{error}</span>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!documentId || !password || isLoading}
                    className="w-full bg-[#293b64] text-white py-5 rounded-[2rem] font-black text-base uppercase tracking-widest shadow-xl shadow-blue-900/30 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={24} className="animate-spin text-white" />
                            <span>{t('login.connecting')}</span>
                        </>
                    ) : (
                        <>
                            <span>{t('login.enter')}</span>
                            <ArrowRight size={24} />
                        </>
                    )}
                </button>
            </form>


            <div className="mt-20 text-center">
                <p className="text-[11px] font-black text-[#293b64] uppercase tracking-[0.2em]">{t('login.secureAccess')}</p>
            </div>

        </div>
    );
};

export default LoginPage;

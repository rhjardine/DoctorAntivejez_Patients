import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isLoading } = useAuthStore();
    const [documentId, setDocumentId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!documentId || !password || isLoading) return;

        setError(null);

        // Clear any old session data before attempting new login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('rejuvenate_session_v1');

        try {
            await login(documentId, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message || "Error al iniciar sesión");
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-white px-8 pt-safe-top pb-safe-bottom items-center justify-center animate-in fade-in duration-700 min-h-screen">

            {/* Branding */}
            <div className="flex flex-col items-center mb-12">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-[2.5rem] shadow-2xl flex items-center justify-center text-white mb-6 transform hover:scale-105 transition-transform">
                    <ShieldCheck size={48} strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl font-black text-darkBlue tracking-tighter">DOCTOR</h1>
                <h1 className="text-5xl font-black text-primary tracking-tighter -mt-2">ANTIVEJEZ</h1>
                <p className="text-sm font-bold text-darkBlue/60 uppercase tracking-[0.2em] mt-3">Medicina Antienvejecimiento</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-darkBlue/40 uppercase tracking-widest ml-1">Documento de Identidad</label>
                        <input
                            type="text"
                            value={documentId}
                            onChange={(e) => setDocumentId(e.target.value)}
                            placeholder="Ej: 5963578"
                            className={`w-full bg-gray-50 border-2 rounded-2xl p-4 text-lg font-bold text-darkBlue focus:outline-none transition-all ${error ? 'border-red-100 focus:border-red-400' : 'border-gray-50 focus:border-primary'
                                }`}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-darkBlue/40 uppercase tracking-widest ml-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full bg-gray-50 border-2 rounded-2xl p-4 text-lg font-bold text-darkBlue focus:outline-none transition-all ${error ? 'border-red-100 focus:border-red-400' : 'border-gray-50 focus:border-primary'
                                }`}
                            required
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 mt-2 px-2 text-red-500 animate-in slide-in-from-top-2">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-bold uppercase">{error}</span>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!documentId || !password || isLoading}
                    className="w-full bg-darkBlue text-white py-5 rounded-2xl font-black text-base uppercase tracking-widest shadow-xl shadow-darkBlue/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={24} className="animate-spin" />
                            <span>Conectando...</span>
                        </>
                    ) : (
                        <>
                            <span>Entrar</span>
                            <ArrowRight size={24} />
                        </>
                    )}
                </button>
            </form>


            <div className="mt-20 text-center opacity-30">
                <p className="text-[9px] font-black text-darkBlue uppercase tracking-[0.3em]">Acceso Seguro para Pacientes</p>
            </div>

        </div>
    );
};

export default LoginPage;

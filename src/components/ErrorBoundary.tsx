import React, { ErrorInfo } from 'react';
import * as Sentry from '@sentry/react';
import { WELLNESS } from '../styles/wellnessPalette';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        if (import.meta.env.PROD) {
            Sentry.captureException(error, { extra: errorInfo as any });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" style={{ background: '#FDFCF9' }}>
                    <img src="/Logo_azul_oscuro.png" alt="Doctor Antivejez" className="h-12 mb-8 opacity-80" />

                    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 max-w-md w-full">
                        <h2 className="text-xl font-black text-darkBlue mb-4 uppercase tracking-tight">Algo salió mal</h2>
                        <p className="text-sm text-textMedium font-medium mb-8 leading-relaxed">
                            La sesión encontró un error inesperado. Por favor recarga la aplicación para continuar.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <div className="mb-8 p-4 bg-red-50 rounded-xl text-left overflow-auto max-h-40">
                                <p className="text-[10px] font-mono text-red-600 font-bold">{this.state.error.message}</p>
                                <pre className="text-[8px] text-red-400 mt-2">{this.state.error.stack}</pre>
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-primary text-white py-4 rounded-full font-black uppercase tracking-widest text-sm shadow-lg shadow-blue-200 active:scale-95 transition-all mb-4"
                        >
                            Recargar Aplicación
                        </button>

                        <a
                            href="/?clear=1"
                            className="text-[10px] font-black uppercase text-textLight underline underline-offset-4 opacity-60 hover:opacity-100"
                        >
                            Si el problema persiste, haz clic aquí para resetear
                        </a>
                    </div>

                    <p className="mt-12 text-[9px] font-black uppercase tracking-[0.3em] opacity-30 text-darkBlue">
                        Protocolo de Seguridad v2.0
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

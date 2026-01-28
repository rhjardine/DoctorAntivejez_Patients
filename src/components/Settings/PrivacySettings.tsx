import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import apiClient from '../../services/apiClient';

export const PrivacySettings = () => {
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await apiClient.get('/mobile-profile-v1');
                setConsent(response.data.shareDataConsent || false);
            } catch (error) {
                console.error("Error fetching privacy settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const toggleConsent = async () => {
        const newVal = !consent;
        setConsent(newVal);
        try {
            await apiClient.patch('/mobile-profile-v1', { shareDataConsent: newVal });
            // In a real app we would use a toast here
            console.log(newVal ? "Ahora compartes tu progreso con tu médico" : "Datos preservados de forma privada");
        } catch (error) {
            setConsent(!newVal); // Rollback on error
            console.error("Error updating privacy settings", error);
        }
    };

    if (loading) return null;

    return (
        <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 transition-all">
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${consent ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {consent ? <ShieldCheck size={20} /> : <Shield size={20} />}
                </div>
                <h3 className="text-sm font-black text-darkBlue dark:text-white uppercase tracking-tighter">Privacidad Médica</h3>
            </div>

            <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-bold text-textMedium dark:text-slate-400 leading-relaxed">
                    Al activar esta opción, permites que el Dr. Juan Carlos Méndez visualice tu adherencia diaria y puntos Omics para un mejor seguimiento clínico.
                </p>
                <button
                    onClick={toggleConsent}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${consent ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                    <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${consent ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                </button>
            </div>

            {!consent && (
                <div className="mt-4 flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-900/20 font-bold">
                    <ShieldAlert size={14} />
                    <span>Tus datos de adherencia son actualmente privados.</span>
                </div>
            )}
        </div>
    );
};

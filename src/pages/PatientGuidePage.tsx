import React, { useState, useEffect } from 'react';
import PatientGuideView from '../components/PatientGuideView';
import { ProtocolService } from '../services/protocolService';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { PatientProtocol } from '../types';

const PatientGuidePage: React.FC = () => {
    const { session } = useAuthStore();
    const { toggleClinicalInfo } = useUIStore();
    const [items, setItems] = useState<PatientProtocol[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncError, setSyncError] = useState<string | null>(null);

    const loadData = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const data = await ProtocolService.fetchActiveProtocol(session.id);
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [session]);

    const handleToggleItem = async (id: string) => {
        if (!session) return;
        const item = items.find(i => i.id === id);
        if (!item) return;

        const previousStatus = item.status;
        const newStatus = previousStatus === 'completed' ? 'pending' : 'completed';

        // Optimistic update
        setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));

        const result = await ProtocolService.updateItemStatus(session.id, id, newStatus);

        // ⚠️ SEGURIDAD CLÍNICA: solo 'confirmed' autoriza a dejar la marca puesta.
        // Nunca dejar al paciente creyendo que registró una toma que su médico no verá.
        if (result === 'failed') {
            // El servidor rechazó la operación, o el ítem no tiene ID estable.
            // Reintentar no lo arregla: se revierte y se informa.
            setItems(prev => prev.map(i => i.id === id ? { ...i, status: previousStatus } : i));
            setSyncError(
                'No pudimos registrar este cambio. Tu médico no lo verá todavía — por favor coméntaselo en tu próxima consulta.'
            );
        } else if (result === 'pending') {
            // Sin conexión: quedó encolado y se enviará al recuperar la red.
            // Se mantiene la marca, pero NO se presenta como confirmada.
            setSyncError(
                'Sin conexión: guardamos tu cambio y lo enviaremos automáticamente cuando vuelvas a tener red. Todavía no está registrado.'
            );
        }
    };

    return (
        <PatientGuideView
            items={items}
            loading={loading}
            onInfoPress={() => toggleClinicalInfo(true)}
            onToggleItem={handleToggleItem}
            onRefresh={loadData}
            syncError={syncError}
            onDismissSyncError={() => setSyncError(null)}
        />
    );
};

export default PatientGuidePage;

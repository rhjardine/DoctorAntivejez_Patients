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

        const synced = await ProtocolService.updateItemStatus(session.id, id, newStatus);

        // ⚠️ SEGURIDAD CLÍNICA: si no se pudo registrar, revertir el estado visual.
        // Nunca dejar al paciente creyendo que registró una toma que su médico no verá.
        if (!synced) {
            setItems(prev => prev.map(i => i.id === id ? { ...i, status: previousStatus } : i));
            setSyncError(
                'No pudimos registrar este cambio. Tu médico no lo verá todavía — por favor coméntaselo en tu próxima consulta.'
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

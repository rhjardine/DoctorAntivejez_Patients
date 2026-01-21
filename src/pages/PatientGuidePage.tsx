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

        const newStatus = item.status === 'completed' ? 'pending' : 'completed';
        // Optimistic update
        setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));

        await ProtocolService.updateItemStatus(session.id, id, newStatus);
    };

    return (
        <PatientGuideView
            items={items}
            loading={loading}
            onInfoPress={() => toggleClinicalInfo(true)}
            onToggleItem={handleToggleItem}
            onRefresh={loadData}
        />
    );
};

export default PatientGuidePage;

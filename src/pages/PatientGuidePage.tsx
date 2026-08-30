import React, { useState, useEffect } from 'react';
import PatientGuideView from '../components/PatientGuideView';
import { ProtocolService } from '../services/protocolService';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { PatientProtocol } from '../types';

/**
 * Guía del paciente — solo lectura.
 *
 * Por indicación médica, la Beta presenta el tratamiento como lectura: se
 * retiraron «Ver Guía» y «Registrar Avances». El registro de adherencia no se
 * ofrece porque el endpoint que lo recibiría no existe todavía en el backend
 * (ADR-005): mostrarlo era pedirle al paciente que marcara algo que su médico
 * nunca iba a ver.
 *
 * `ProtocolService.updateItemStatus` se conserva intacto, con sus pruebas, para
 * poder reactivar la marca en cuanto el backend exponga el endpoint.
 */
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

    return (
        <PatientGuideView
            items={items}
            loading={loading}
            onInfoPress={() => toggleClinicalInfo(true)}
            onRefresh={loadData}
        />
    );
};

export default PatientGuidePage;

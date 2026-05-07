import React, { useState, useEffect } from 'react';
import BiometricsView from '../components/BiometricsView';
import { ProtocolService } from '../services/protocolService';
import { BiometricData } from '../types';
import apiClient from '../services/apiClient';
import { offlineQueue } from '../services/offlineQueue';
import { tokenStore } from '../services/authService';

const BiometricsPage: React.FC = () => {
    const [entries, setEntries] = useState<BiometricData[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const profile = await ProtocolService.getMyProfile();
            if (profile) {
                const newEntries: BiometricData[] = [];

                if (profile.biophysics) {
                    const bp = profile.biophysics;
                    if (bp.systolicPressure && bp.diastolicPressure) {
                        newEntries.push({
                            id: bp.id + '_bp',
                            userId: profile.id,
                            type: 'BLOOD_PRESSURE',
                            value: `${bp.systolicPressure}/${bp.diastolicPressure}`,
                            numericValue: bp.systolicPressure, // Use systolic for trend?
                            unit: 'mmHg',
                            recordedAt: bp.testDate,
                            timestamp: new Date(bp.testDate),
                            source: 'CLINICAL'
                        });
                    }
                }

                if (profile.biochemistry) {
                    const bc = profile.biochemistry;
                    if (bc.postPrandial) {
                        newEntries.push({
                            id: bc.id + '_glucose',
                            userId: profile.id,
                            type: 'GLUCOSE',
                            value: bc.postPrandial.toString(),
                            numericValue: bc.postPrandial,
                            unit: 'mg/dL',
                            recordedAt: bc.testDate,
                            timestamp: new Date(bc.testDate),
                            source: 'CLINICAL'
                        });
                    }
                }

                if (profile.latestNlr) {
                    const nlr = profile.latestNlr;
                    newEntries.push({
                        id: nlr.id + '_nlr',
                        userId: profile.id,
                        type: 'NLR',
                        value: nlr.nlrValue.toFixed(2),
                        numericValue: nlr.nlrValue,
                        unit: 'Ratio',
                        recordedAt: nlr.testDate,
                        timestamp: new Date(nlr.testDate),
                        source: 'CLINICAL'
                    });
                }

                setEntries(newEntries);
            }
        };
        loadData();
    }, []);

    const handleAdd = async (entry: any) => {
        // Optimistic add
        const tempId = Math.random().toString(36).substr(2, 9);
        const newEntry = {
            ...entry,
            id: tempId,
            userId: 'me',
            recordedAt: new Date().toISOString()
        };
        setEntries(prev => [...prev, newEntry]);

        try {
            const { data } = await apiClient.post('/mobile-biometrics-v1', entry);
            if (data?.id) {
                setEntries(prev => prev.map(e => e.id === tempId ? { ...e, id: data.id } : e));
            }
        } catch (error) {
            console.warn("Biometrics save network failed, enqueueing for sync", error);
            const baseUrl = apiClient.defaults.baseURL || '';
            const fullUrl = baseUrl.endsWith('/') ? `${baseUrl}mobile-biometrics-v1` : `${baseUrl}/mobile-biometrics-v1`;

            await offlineQueue.enqueue({
                url: fullUrl,
                method: 'POST',
                body: JSON.stringify(entry),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenStore.getAccessToken() || ''}`,
                },
            });
        }
    };

    const handleDelete = async (id: string) => {
        // Optimistic UI remove
        setEntries(prev => prev.filter(e => e.id !== id));

        try {
            await apiClient.delete(`/mobile-biometrics-v1/${id}`);
        } catch (error) {
            console.warn("Biometrics delete network failed, enqueueing for sync", error);
            const baseUrl = apiClient.defaults.baseURL || '';
            const fullUrl = baseUrl.endsWith('/') ? `${baseUrl}mobile-biometrics-v1/${id}` : `${baseUrl}/mobile-biometrics-v1/${id}`;

            await offlineQueue.enqueue({
                url: fullUrl,
                method: 'PATCH',
                body: JSON.stringify({ deleted: true }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenStore.getAccessToken() || ''}`,
                },
            });
        }
    };

    return (
        <BiometricsView
            entries={entries}
            onAdd={handleAdd}
            onDelete={handleDelete}
        />
    );
};

export default BiometricsPage;

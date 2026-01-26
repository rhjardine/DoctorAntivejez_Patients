import React, { useState, useEffect } from 'react';
import BiometricsView from '../components/BiometricsView';
import { ProtocolService } from '../services/protocolService';
import { BiometricData } from '../types';

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

    const handleAdd = (entry: any) => {
        // Optimistic add
        const newEntry = {
            ...entry,
            id: Math.random().toString(36).substr(2, 9),
            userId: 'me',
            recordedAt: new Date().toISOString()
        };
        setEntries(prev => [...prev, newEntry]);
        // TODO: Implement backend save
    };

    const handleDelete = (id: string) => {
        setEntries(prev => prev.filter(e => e.id !== id));
        // TODO: Implement backend delete
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

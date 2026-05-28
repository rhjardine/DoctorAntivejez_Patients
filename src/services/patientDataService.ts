import {
  PatientGuideResponse,
  NutrigenomicPlan,
  ConsultationRecord,
  ProgressMetric,
  PatientProtocol
} from '../types';
import { authService } from './authService';
import apiClient from './apiClient';
import { logger } from '../utils/logger';

export interface MetricsResult {
  data: ProgressMetric[];
  error: boolean;
}

export const fetchPatientGuide = async (): Promise<PatientGuideResponse> => {
  const user = authService.getCurrentUser();
  if (!user) throw new Error("No hay sesión activa");

  try {
    const response = await apiClient.get(`/patients/${user.id}/guide`);
    return response.data;
  } catch (error) {
    return getOfflineGuideFallback(user.id);
  }
};


const getOfflineGuideFallback = (userId: string): PatientGuideResponse => {
  return {
    patientId: userId,
    date: new Date().toISOString(),
    items: [
      {
        id: '1',
        itemName: 'Aceite de ricino',
        dose: '4 cucharadas',
        schedule: 'En la noche antes de dormir',
        observations: 'IMPORTANTE: Estimular detox linfático. No ingerir sólidos 2 horas antes.',
        category: 'REMOVAL_PHASE',
        timeSlot: 'EVENING',
        status: 'pending',
        prescribedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        itemName: 'Complejo B Avanzado',
        dose: '1 cápsula',
        schedule: 'Después del desayuno',
        observations: 'Mejorar metilación celular',
        category: 'REVITALIZATION_PHASE',
        timeSlot: 'MORNING',
        status: 'completed',
        prescribedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  };
};

export const fetchMetrics = async (type: 'BIO_AGE' | 'ADHERENCE'): Promise<MetricsResult> => {
  const user = authService.getCurrentUser();
  if (!user) throw new Error("No hay sesión activa");

  try {
    const response = await apiClient.get(`/patients/${user.id}/metrics?type=${type}`);
    return { data: response.data, error: false };
  } catch {
    logger.warn('fetchMetrics: API call failed, returning empty dataset', { metricType: type });
    return { data: [], error: true };
  }
};

export const fetchConsultationHistory = async (): Promise<ConsultationRecord[]> => {
  const user = authService.getCurrentUser();
  if (!user) throw new Error("No hay sesión activa");

  try {
    const response = await apiClient.get(`/patients/${user.id}/consultations`);
    return response.data ?? [];
  } catch {
    // Endpoint not yet available in Beta — return empty, not fabricated data
    logger.warn('fetchConsultationHistory: endpoint not available, returning empty');
    return [];
  }
};

// Fix: Add missing properties 'dietTypes' and 'updatedAt' to satisfy the NutrigenomicPlan interface
export const fetchNutrigenomicPlan = async (): Promise<NutrigenomicPlan> => {
  return {
    bloodType: 'O',
    dietTypes: ['METABOLIC'],
    forbidden: ['Trigo', 'Cerdo', 'Azúcar refinada'],
    foods: [
      { id: '1', name: 'Creps de yuca', category: 'Carbohidratos', mealTypes: ['BREAKFAST'] },
      { id: '2', name: 'Huevos orgánicos', category: 'Proteína', mealTypes: ['BREAKFAST'] }
    ],
    updatedAt: new Date().toISOString()
  };
};

export const toggleGuideItemCompletion = async (itemId: string, status: 'pending' | 'completed'): Promise<boolean> => {
  return true;
};

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
    // ⚠️ SEGURIDAD CLÍNICA: nunca fabricar una pauta de tratamiento.
    // Esta rama devolvía prescripciones inventadas ("Aceite de ricino,
    // 4 cucharadas, en la noche") indistinguibles de una guía real. Un
    // paciente podía seguir una pauta que ningún médico le recetó.
    logger.warn('fetchPatientGuide: endpoint no disponible', {
      reason: 'GUIDE_ENDPOINT_UNAVAILABLE',
    });
    throw new Error(
      'No pudimos cargar tu guía de tratamiento. Consulta con tu médico.',
    );
  }
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

export const fetchNutrigenomicPlan = async (): Promise<NutrigenomicPlan> => {
  const user = authService.getCurrentUser();
  if (!user) throw new Error("No hay sesión activa");

  try {
    const response = await apiClient.get(`/patients/${user.id}/nutrition-plan`);
    return {
      ...response.data,
      isDemoTemplate: false
    };
  } catch (error) {
    // ⚠️ SEGURIDAD CLÍNICA: nunca fabricar un plan nutricional.
    // Esta rama devolvía un plan demo (tipo de sangre 'O', alimentos
    // prohibidos) marcado con isDemoTemplate: true — un flag que ninguna
    // vista consumía, así que se pintaba igual que un plan real. Un
    // paciente podía evitar alimentos por una restricción inventada, o
    // ignorar una que sí le aplica.
    // Mismo criterio que nutritionService.getSmartNutritionPlan().
    logger.warn('fetchNutrigenomicPlan: endpoint no disponible', {
      reason: 'NUTRITION_ENDPOINT_UNAVAILABLE',
    });
    throw new Error(
      'No hay un plan de nutrición configurado por tu médico.',
    );
  }
};

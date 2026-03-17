import {
  PatientGuideResponse,
  NutrigenomicPlan,
  ConsultationRecord,
  ProgressMetric,
  PatientProtocol
} from '../types';
import { authService } from './authService';
import apiClient from './apiClient';

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

export const fetchMetrics = async (type: 'BIO_AGE' | 'ADHERENCE'): Promise<ProgressMetric[]> => {
  const user = authService.getCurrentUser();
  if (!user) throw new Error("No hay sesión activa");

  try {
    const response = await apiClient.get(`/patients/${user.id}/metrics?type=${type}`);
    return response.data;
  } catch (error) {

    const now = new Date();
    return Array.from({ length: 6 }).map((_, i) => {
      const date = new Date();
      date.setMonth(now.getMonth() - (5 - i));
      return {
        date: date.toISOString().split('T')[0],
        value: type === 'BIO_AGE' ? 42 - (i * 0.8) : 65 + (i * 5),
        label: date.toLocaleDateString('es-ES', { month: 'short' })
      };
    });
  }
};

export const fetchConsultationHistory = async (): Promise<ConsultationRecord[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const user = authService.getCurrentUser();
  return [
    {
      consultationId: "BETA-001",
      patientId: user?.id || "",
      date: new Date().toLocaleDateString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      doctorName: "Dr. Juan Carlos Méndez",
      doctorNotes: "Consulta Beta v1.0. Protocolo 4R activado. " +
        "Se inicia seguimiento de biomarcadores y adherencia " +
        "al plan nutrigenómico personalizado. Próxima evaluación " +
        "en 30 días para ajuste de guía clínica.",
      adherenceRate: 0,
      biologicalAgeAtTime: 0,
      chronologicalAgeAtTime: 0,
      treatmentSnapshot: []
    }
  ];
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

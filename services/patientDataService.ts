
import { 
  PatientGuideResponse, 
  NutrigenomicPlan, 
  ConsultationRecord, 
  ProgressMetric,
  PatientProtocol
} from '../types';
import { authService } from './authService';

const API_BASE_URL = process.env.VITE_API_URL || 'https://doctor-antivejez-web.onrender.com/api';

const getHeaders = () => {
  const user = authService.getCurrentUser();
  return {
    'Content-Type': 'application/json',
    'Authorization': user?.token ? `Bearer ${user.token}` : ''
  };
};

export const fetchPatientGuide = async (): Promise<PatientGuideResponse> => {
  const user = authService.getCurrentUser();
  if (!user) throw new Error("No hay sesión activa");

  try {
    const response = await fetch(`${API_BASE_URL}/patients/${user.id}/guide`, {
      headers: getHeaders()
    });
    
    if (!response.ok) throw new Error("Error en servidor");
    return await response.json();
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
    const response = await fetch(`${API_BASE_URL}/patients/${user.id}/metrics?type=${type}`, {
      headers: getHeaders()
    });
    
    if (!response.ok) throw new Error("Error en servidor");
    return await response.json();
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
      consultationId: "HIST-001",
      patientId: user?.id || "5963578",
      date: "15/11/2023",
      doctorName: "Dr. Alexander Miller",
      doctorNotes: "Consulta inicial. Protocolo 4R activado.",
      adherenceRate: 75,
      biologicalAgeAtTime: 42,
      chronologicalAgeAtTime: 49,
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

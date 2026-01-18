
import { PatientProtocol, PatientGuideResponse, NutrigenomicPlan } from '../types';
import { authService } from './authService';

const RENDER_API_BASE_URL = 'https://doctor-antivejez-web.onrender.com/api';
const PROTOCOL_STORAGE_KEY = 'rejuvenate_protocol_cache';
const NUTRITION_STORAGE_KEY = 'rejuvenate_nutrition_cache';

export const ProtocolService = {
  fetchActiveProtocol: async (patientId: string): Promise<PatientProtocol[]> => {
    const user = authService.getCurrentUser();
    try {
      const response = await fetch(`${RENDER_API_BASE_URL}/patients/${patientId}/guide`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user?.token ? `Bearer ${user.token}` : ''
        }
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data: PatientGuideResponse = await response.json();
      if (data?.items) {
        localStorage.setItem(`${PROTOCOL_STORAGE_KEY}_${patientId}`, JSON.stringify(data.items));
        return data.items;
      }
      return [];
    } catch (error) {
      const cached = localStorage.getItem(`${PROTOCOL_STORAGE_KEY}_${patientId}`);
      return cached ? JSON.parse(cached) : [];
    }
  },

  fetchNutrigenomicPlan: async (patientId: string): Promise<NutrigenomicPlan | null> => {
    const user = authService.getCurrentUser();
    try {
      const response = await fetch(`${RENDER_API_BASE_URL}/patients/${patientId}/nutrition-plan`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user?.token ? `Bearer ${user.token}` : ''
        }
      });
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data: NutrigenomicPlan = await response.json();
      localStorage.setItem(`${NUTRITION_STORAGE_KEY}_${patientId}`, JSON.stringify(data));
      return data;
    } catch (error) {
      const cached = localStorage.getItem(`${NUTRITION_STORAGE_KEY}_${patientId}`);
      return cached ? JSON.parse(cached) : null;
    }
  },

  updateItemStatus: async (patientId: string, itemId: string, status: 'pending' | 'completed'): Promise<boolean> => {
    const user = authService.getCurrentUser();
    try {
      const response = await fetch(`${RENDER_API_BASE_URL}/protocols/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': user?.token ? `Bearer ${user.token}` : ''
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        const cachedData = localStorage.getItem(`${PROTOCOL_STORAGE_KEY}_${patientId}`);
        if (cachedData) {
          const items: PatientProtocol[] = JSON.parse(cachedData);
          const updatedItems = items.map(item => item.id === itemId ? { ...item, status } : item);
          localStorage.setItem(`${PROTOCOL_STORAGE_KEY}_${patientId}`, JSON.stringify(updatedItems));
        }
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
};

import axios from 'axios';
import { useProfileStore } from '../store/useProfileStore';
import { logger } from '../utils/logger';

// ✅ SECURITY: URL centralizada via variable de entorno
const API_URL = import.meta.env.VITE_API_URL || '';

const BACKEND_URL = import.meta.env.DEV
  ? '/api/vcoach-chat'
  : `${API_URL}/vcoach-chat-v1`;

const VISION_API_URL = import.meta.env.DEV
  ? '/api/vision-v1'
  : `${API_URL}/api/vision-v1`;

export interface FoodAnalysisResult {
  productName: string;
  recommendation: 'RECOMMENDED' | 'MODERATE' | 'AVOID';
  reasoning: string;
  macros: { sugar: string; carbs: string; protein: string; };
  inflammatoryIngredients: string[];
}

export const sendMessageToVCoach = async (message: string, chatHistory: any[] = []) => {
  const profile = useProfileStore.getState().profileData;

  // ✅ SECURITY: patientContext is sent to backend only, never logged with PHI
  const patientContext = {
    name: profile?.firstName || "Paciente",
    chronoAge: profile?.chronologicalAge || null,
    bioAge: profile?.biologicalAge || null,
    gap: (profile?.chronologicalAge && profile?.biologicalAge)
      ? profile.chronologicalAge - profile.biologicalAge
      : null,
    bloodType: profile?.bloodType || null
  };

  try {
    const response = await axios.post(BACKEND_URL, {
      message,
      history: chatHistory,
      patientContext
    });

    logger.audit('vcoach_message_sent', { messageLength: message.length });
    return response.data.text;
  } catch (error) {
    logger.error('Error al conectar con el VCoach', { url: BACKEND_URL });
    throw new Error("No pudimos conectar con tu VCoach. Intenta de nuevo.");
  }
};

export const startChatSession = async (context?: any) => {
  return true;
};

export const analyzeFoodImage = async (base64Image: string): Promise<FoodAnalysisResult> => {
  try {
    const response = await axios.post(VISION_API_URL, {
      imageBase64: base64Image
    });
    logger.audit('food_image_analyzed');
    return response.data;
  } catch (error) {
    logger.error('Vision AI Error', { url: VISION_API_URL });
    throw new Error("Error al analizar la imagen. Intenta nuevamente.");
  }
};
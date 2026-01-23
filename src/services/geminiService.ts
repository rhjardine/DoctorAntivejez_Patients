
import { GoogleGenAI, Chat } from "@google/genai";
import { useProfileStore } from "../store/useProfileStore";
import { authService } from "./authService";

interface PatientContext {
  name?: string;
  chronologicalAge?: number;
  biologicalAge?: number;
  bloodType?: string;
}

// Get data from store if not provided in context
const profile = useProfileStore.getState().profileData;

const name = context?.name || (authService.getCurrentUser()?.email?.split('@')[0] || 'Paciente');
const chromeAge = context?.chronologicalAge || profile?.chronologicalAge || 58;
const bioAge = context?.biologicalAge || profile?.biologicalAge || 65;
const bType = context?.bloodType || profile?.bloodType || 'O';

const gap = chromeAge - bioAge;

return `Eres el VCoach de Doctor Antivejez. Estás hablando con ${name}. Su edad cronológica es ${chromeAge}, su edad biológica es ${bioAge}, lo que le da un bono de vitalidad de ${gap} años. Su grupo sanguíneo es ${bType}. Usa esta información para dar consejos nutricionales y de actividad física ultra-personalizados.`;
};

let chatSession: Chat | null = null;

export const startChatSession = async (patientContext?: PatientContext): Promise<Chat> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: buildSystemInstruction(patientContext),
      temperature: 0.7,
    },
  });
  return chatSession;
};

export const sendMessageToVCoach = async (message: string): Promise<string> => {
  try {
    if (!chatSession) {
      await startChatSession();
    }
    if (!chatSession) throw new Error("No session");
    const response = await chatSession.sendMessage({ message });
    return response.text || "No tengo respuesta en este momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al conectar con VCoach.";
  }
};

export interface FoodAnalysisResult {
  productName: string;
  recommendation: 'RECOMMENDED' | 'MODERATE' | 'AVOID';
  reasoning: string;
  macros: { sugar: string; carbs: string; protein: string; };
  inflammatoryIngredients: string[];
}

export const analyzeFoodImage = async (base64Image: string): Promise<FoodAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: "Analiza esta comida para una dieta antienvejecimiento. Devuelve JSON: productName, recommendation, reasoning, macros, inflammatoryIngredients." }
        ]
      },
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Vision Error:", error);
    throw error;
  }
};

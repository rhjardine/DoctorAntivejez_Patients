import { GoogleGenerativeAI } from "@google/generative-ai";
import { useProfileStore } from "../store/useProfileStore";
import { authService } from "./authService";

// 1. Tipado de Interfaces
interface PatientContext {
  name?: string;
  chronologicalAge?: number;
  biologicalAge?: number;
  bloodType?: string;
}

export interface FoodAnalysisResult {
  productName: string;
  recommendation: 'RECOMMENDED' | 'MODERATE' | 'AVOID';
  reasoning: string;
  macros: { sugar: string; carbs: string; protein: string; };
  inflammatoryIngredients: string[];
}

// 2. Inicialización de IA (Vite standard)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// 3. Constructor de Instrucciones (Arreglo del error de lógica previo)
const buildSystemInstruction = (context?: PatientContext): string => {
  const profile = useProfileStore.getState().profileData;

  const name = context?.name || profile?.firstName || (authService.getCurrentUser()?.email?.split('@')[0] || 'Paciente');
  const chronoAge = context?.chronologicalAge || profile?.chronologicalAge || 51;
  const bioAge = context?.biologicalAge || profile?.biologicalAge || 45;
  const bType = context?.bloodType || profile?.bloodType || 'A+';
  const gap = chronoAge - bioAge;

  return `Eres el VCoach de Doctor Antivejez. Estás hablando con el paciente ${name}. 
          Su perfil actual: Edad ${chronoAge}, Edad Biológica ${bioAge} (Vitalidad: +${gap} años), Grupo Sanguíneo ${bType}. 
          Usa esta información para dar consejos de longevidad, nutrición y actividad física personalizados bajo el protocolo de la clínica. 
          Sé motivador pero científicamente riguroso.`;
};

// 4. Gestión de Sesión de Chat
let chatSession: any = null;

export const startChatSession = async (context?: PatientContext) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", // Versión estable y rápida para PWA
    systemInstruction: buildSystemInstruction(context),
  });

  chatSession = model.startChat({
    generationConfig: {
      maxOutputTokens: 800,
      temperature: 0.7,
    },
  });
  return chatSession;
};

export const sendMessageToVCoach = async (message: string) => {
  try {
    if (!chatSession) {
      await startChatSession();
    }
    const result = await chatSession.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("🔥 [Gemini Chat Error]:", error);
    return "Lo siento, Richard. Mi conexión con el laboratorio central se ha interrumpido. ¿Podrías intentar de nuevo?";
  }
};

// 5. Análisis de Alimentos (Vision AI)
export const analyzeFoodImage = async (base64Image: string): Promise<FoodAnalysisResult> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");

  const prompt = "Analiza esta imagen de comida bajo el protocolo Antivejez. Grupo Sanguíneo del paciente: A+. Responde estrictamente en formato JSON con estas llaves: productName, recommendation (RECOMMENDED/MODERATE/AVOID), reasoning, macros (sugar, carbs, protein), inflammatoryIngredients.";

  try {
    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } }
    ]);

    const textResponse = result.response.text();
    // Limpieza de posibles tags de markdown que Gemini a veces añade
    const jsonString = textResponse.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("🔥 [Vision AI Error]:", error);
    throw new Error("No pude analizar la imagen. Asegúrate de que sea clara.");
  }
};


import { GoogleGenAI, Chat } from "@google/genai";

const SYSTEM_INSTRUCTION = `
Eres VCoach, asistente médico de Rejuvenate. 
Ayudas a pacientes a reducir su edad biológica mediante las 5A Claves y Terapias 4R.
Responde de forma concisa y profesional en español.
`;

let chatSession: Chat | null = null;

export const startChatSession = async (): Promise<Chat> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
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

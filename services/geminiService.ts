
import { GoogleGenAI } from "@google/genai";

// The API key is obtained from the environment variable `process.env.API_KEY`.
// This is assumed to be pre-configured and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getJiuJitsuTip = async (): Promise<string> => {
  try {
    // If process.env.API_KEY is not set, the GoogleGenAI constructor or the API call will throw an error,
    // which will be caught below.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Forneça uma dica rápida e útil de jiu-jitsu para praticantes, com no máximo 2 frases. A dica deve ser sobre técnica, estratégia ou mentalidade.",
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching Jiu-Jitsu tip from Gemini:", error);
    // Provide a user-friendly fallback message.
    return "Não foi possível carregar a dica do dia. Lembre-se: a constância nos treinos vence o talento.";
  }
};
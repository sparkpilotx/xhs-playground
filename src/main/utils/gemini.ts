import { GoogleGenAI } from "@google/genai";

export function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({ apiKey });
}

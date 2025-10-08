// libs/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ambil API Key dari environment variable
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

// Ekspor instance GoogleGenerativeAI
export const genAI = new GoogleGenerativeAI(apiKey);

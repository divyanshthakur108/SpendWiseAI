import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

let aiClient = null;

if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_openai_api_key_here') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn('[Gemini Config Warning] Failed to initialize GoogleGenAI:', error.message);
  }
}

export default aiClient;

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configure OpenAI SDK client for AI insights and expense classification
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'placeholder_api_key',
});

export default openai;

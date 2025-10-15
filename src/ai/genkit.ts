
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { groq } from '@genkit-ai/groq';

export const ai = genkit({
  plugins: [
    googleAI({ apiKey: process.env.GEMINI_API_KEY, defaultModel: 'gemini-pro' }),
    groq({ apiKey: process.env.GROQ_API_KEY }),
  ],
});

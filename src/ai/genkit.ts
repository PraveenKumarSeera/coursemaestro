
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { plugin } from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    plugin(),
    googleAI({ apiKey: process.env.GEMINI_API_KEY }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

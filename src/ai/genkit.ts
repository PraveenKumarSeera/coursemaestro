
import { configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = configureGenkit({
  plugins: [
    googleAI({ apiVersion: 'v1', model: 'gemini-pro' }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

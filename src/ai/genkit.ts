
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {defineConfig} from 'genkit';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});


import {genkit} from 'genkit';
import {groq} from 'genkitx-groq';
import next from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    groq({apiKey: process.env.GROQ_API_KEY}),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

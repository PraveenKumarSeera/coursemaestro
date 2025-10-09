
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import next from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    next({
      plugins: [googleAI()],
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

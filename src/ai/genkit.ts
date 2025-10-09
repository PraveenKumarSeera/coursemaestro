
import {genkit, next} from 'genkit/next';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    next({
      plugins: [googleAI()],
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

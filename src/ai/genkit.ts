'use server';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import next from '@genkit-ai/next';
import {courseMaestroAI} from './genkit-plugin';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
    next(),
    courseMaestroAI,
  ],
  // We do not need to specify a model here.
});

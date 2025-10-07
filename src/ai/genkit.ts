import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {next} from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
    next({
      // We are not using the dev server, so this is not needed.
      // devServer: {
      //   port: 4001,
      // },
    }),
  ],
  // We do not need to specify a model here.
});

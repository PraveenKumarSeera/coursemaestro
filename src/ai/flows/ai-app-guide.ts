
'use server';
/**
 * @fileOverview An AI chatbot that can answer questions about the features of this application.
 *
 * This file is currently not in use as the chatbot feature was removed from the UI.
 * The code is kept here as a reference for future development.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit/zod';

const AppGuideInputSchema = z.object({
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .describe('The history of the conversation so far.'),
});

export type AppGuideInput = z.infer<typeof AppGuideInputSchema>;

const AppGuideOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question.'),
});

export type AppGuideOutput = z.infer<typeof AppGuideOutputSchema>;

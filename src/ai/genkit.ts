
'use server';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import next from '@genkit-ai/next';
import { aiStudyAssistantFlow } from '@/ai/flows/ai-study-assistant';
import { quizGeneratorFlow } from '@/ai/flows/ai-quiz-generator';
import { performanceAnalyzerFlow } from '@/ai/flows/ai-performance-analyzer';
import { careerAdvisorFlow } from '@/ai/flows/ai-career-advisor';
import { materialParserFlow } from '@/ai/flows/ai-material-parser';
import { resumeBuilderFlow } from '@/ai/flows/ai-resume-builder';
import { teachingAssistantFlow } from '@/ai/flows/ai-teaching-assistant';
import { motivationBotFlow } from '@/ai/flows/ai-motivation-bot';

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
    next(),
    {
      plugin: {
        name: 'courseMaestro',
        provides: {},
      },
      flows: [
        aiStudyAssistantFlow,
        quizGeneratorFlow,
        performanceAnalyzerFlow,
        careerAdvisorFlow,
        materialParserFlow,
        resumeBuilderFlow,
        teachingAssistantFlow,
        motivationBotFlow,
      ],
    }
  ],
  // We do not need to specify a model here.
});

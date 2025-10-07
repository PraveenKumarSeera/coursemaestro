import { genkitPlugin, Plugin } from 'genkit';

import { aiStudyAssistantFlow } from '@/ai/flows/ai-study-assistant';
import { quizGeneratorFlow } from '@/ai/flows/ai-quiz-generator';
import { performanceAnalyzerFlow } from '@/ai/flows/ai-performance-analyzer';
import { careerAdvisorFlow } from '@/ai/flows/ai-career-advisor';
import { materialParserFlow } from '@/ai/flows/ai-material-parser';
import { resumeBuilderFlow } from '@/ai/flows/ai-resume-builder';
import { teachingAssistantFlow } from '@/ai/flows/ai-teaching-assistant';
import { motivationBotFlow } from '@/ai/flows/ai-motivation-bot';

export const courseMaestroAI: Plugin<[]> = genkitPlugin(
  'courseMaestro',
  async () => {
    return {
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
    };
  }
);

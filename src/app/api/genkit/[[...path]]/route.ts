import { nextHandler } from '@genkit-ai/next';
import { courseMaestroAI } from '@/ai/genkit-plugin';

export const GET = nextHandler(courseMaestroAI);
export const POST = nextHandler(courseMaestroAI);

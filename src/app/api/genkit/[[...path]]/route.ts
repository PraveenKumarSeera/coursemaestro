import { nextHandler } from '@genkit-ai/next';
import { ai } from '@/ai/genkit';

export const GET = nextHandler(ai);
export const POST = nextHandler(ai);

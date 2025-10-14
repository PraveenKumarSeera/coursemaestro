import { nextHandler } from '@genkit-ai/next';
import '@/ai/register';

// This is the entry point for Genkit in a Next.js app.
// It is automatically configured based on the genkit() export in src/ai/genkit.ts
export const GET = nextHandler();
export const POST = nextHandler();

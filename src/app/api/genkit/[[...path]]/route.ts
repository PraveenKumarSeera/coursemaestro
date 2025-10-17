import { createNextApiHandler } from '@genkit-ai/next';
import'@/ai/register';
import { ai } from '@/ai/genkit';

// This is the entry point for Genkit in a Next.js app.
// It is automatically configured based on the genkit() export in src/ai/genkit.ts
export const { GET, POST } = createNextApiHandler({ ai });

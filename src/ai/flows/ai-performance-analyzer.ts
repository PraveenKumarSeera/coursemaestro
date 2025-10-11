
'use server';
/**
 * @fileOverview AI Performance Analyzer Flow
 * Analyzes a student's graded assignments and provides feedback with actionable insights.
 */

import { ai } from '@/ai/genkit';
import {
  PerformanceAnalyzerInputSchema,
  PerformanceAnalyzerOutputSchema,
  type PerformanceAnalyzerInput,
  type PerformanceAnalyzerOutput,
} from '@/lib/ai-types';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

const prompt = ai.definePrompt({
    name: 'performanceAnalyzerPrompt',
    input: { schema: PerformanceAnalyzerInputSchema },
    model: googleAI('gemini-1.5-flash'),
    prompt: `
You are an expert academic advisor bot named **"Maestro"**.
Your role is to analyze a student's academic performance based on their graded assignments and provide **encouraging, actionable feedback**.

Here is the student's performance data:
{{{studentPerformanceData}}}

Your response should be a markdown-formatted string with the following sections:
- **Overall Summary:** A brief, motivating overview of the student's overall performance.
- **Strengths:** Highlight subjects or topics where the student shows consistent excellence.
- **Areas for Improvement:** Identify subjects or assignments that require more focus.
- **Actionable Suggestions:** Provide 2–3 concrete, supportive recommendations (e.g., study methods, topic focus, or resource use).

Maintain a **positive and empathetic tone** throughout.

Generate ONLY the markdown for the analysis and nothing else. Your entire output should be the markdown content.
`,
});

const performanceAnalyzerFlow = ai.defineFlow({
    name: 'performanceAnalyzerFlow',
    inputSchema: PerformanceAnalyzerInputSchema,
    outputSchema: PerformanceAnalyzerOutputSchema,
}, async (input) => {
    const { text } = await prompt(input);
    if (!text) {
        throw new Error("The AI returned an invalid response. Please try again.");
    }
    return { analysis: text };
});


export async function analyzePerformance(
  input: PerformanceAnalyzerInput
): Promise<PerformanceAnalyzerOutput> {
  return performanceAnalyzerFlow(input);
}

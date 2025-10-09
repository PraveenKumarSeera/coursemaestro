
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
    output: { schema: PerformanceAnalyzerOutputSchema },
    model: googleAI('gemini-1.5-flash'),
    prompt: `
You are an expert academic advisor bot named **"Maestro"**.
Your role is to analyze a student's academic performance based on their graded assignments and provide **encouraging, actionable feedback**.

Here is the student's performance data:
{{{studentPerformanceData}}}

Analyze the provided list of graded assignments and identify patterns, strengths, and areas for improvement.

Structure your response in **Markdown** format with the following sections:
- **Overall Summary:** A brief, motivating overview of the student's overall performance.
- **Strengths:** Highlight subjects or topics where the student shows consistent excellence.
- **Areas for Improvement:** Identify subjects or assignments that require more focus.
- **Actionable Suggestions:** Provide 2–3 concrete, supportive recommendations (e.g., study methods, topic focus, or resource use).

Maintain a **positive and empathetic tone** throughout.

Generate the response in the specified JSON format.
`,
});

const performanceAnalyzerFlow = ai.defineFlow({
    name: 'performanceAnalyzerFlow',
    inputSchema: PerformanceAnalyzerInputSchema,
    outputSchema: PerformanceAnalyzerOutputSchema,
}, async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI returned an invalid response. Please try again.");
    }
    return output;
});


export async function analyzePerformance(
  input: PerformanceAnalyzerInput
): Promise<PerformanceAnalyzerOutput> {
  return performanceAnalyzerFlow(input);
}

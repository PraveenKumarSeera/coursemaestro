
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
import { googleAI } from '@genkit-ai/google-genai';

const prompt = ai.definePrompt({
    name: 'performanceAnalyzerPrompt',
    input: { schema: PerformanceAnalyzerInputSchema },
    output: { schema: PerformanceAnalyzerOutputSchema },
    model: googleAI.model('gemini-1.5-flash'),
    prompt: `
You are an expert academic advisor bot named **"Maestro"**.
Your role is to analyze a student's academic performance based on their graded assignments and provide **encouraging, actionable feedback**.

The student's name is {{{studentName}}}.

Here is the student's performance data:
{{{studentPerformanceData}}}

Your response must be in the specified JSON format.
- **summary:** A brief, motivating overview of the student's overall performance, addressed to them by name.
- **strengths:** A list of subjects or topics where the student shows consistent excellence.
- **improvements:** A list of subjects or assignments that require more focus.

Maintain a **positive and empathetic tone** throughout.
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

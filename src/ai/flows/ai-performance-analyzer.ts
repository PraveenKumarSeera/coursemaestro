
'use server';
/**
 * @fileOverview AI Performance Analyzer Flow
 * Analyzes a student's graded assignments and provides feedback with actionable insights.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import {
  PerformanceAnalyzerInputSchema,
  PerformanceAnalyzerOutputSchema,
  type PerformanceAnalyzerInput,
  type PerformanceAnalyzerOutput,
} from '@/lib/ai-types';


export async function analyzePerformance(
  input: PerformanceAnalyzerInput
): Promise<PerformanceAnalyzerOutput> {
  return await analyzePerformanceFlow(input);
}


const analyzePerformanceFlow = ai.defineFlow(
  {
    name: 'analyzePerformanceFlow',
    inputSchema: PerformanceAnalyzerInputSchema,
    outputSchema: PerformanceAnalyzerOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `
You are an expert academic advisor bot named **"Maestro"**.
Your role is to analyze a student's academic performance based on their graded assignments and provide **encouraging, actionable feedback**.

Here is the student's performance data:
${input.studentPerformanceData}

Analyze the provided list of graded assignments and identify patterns, strengths, and areas for improvement.

Structure your response in **Markdown** format with the following sections:
- **Overall Summary:** A brief, motivating overview of the student's overall performance.
- **Strengths:** Highlight subjects or topics where the student shows consistent excellence.
- **Areas for Improvement:** Identify subjects or assignments that require more focus.
- **Actionable Suggestions:** Provide 2–3 concrete, supportive recommendations (e.g., study methods, topic focus, or resource use).

Maintain a **positive and empathetic tone** throughout.
`,
      model: googleAI.model('gemini-1.5-flash-latest'),
      output: {
        schema: PerformanceAnalyzerOutputSchema,
      },
    });

    if (!output) {
      throw new Error('Failed to generate performance analysis.');
    }

    return output;
  }
);

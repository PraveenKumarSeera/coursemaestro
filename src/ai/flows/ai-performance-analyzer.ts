
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

/**
 * Public function to trigger the AI performance analysis flow.
 * @param input - Student's graded assignment data.
 * @returns A detailed analysis with strengths, weaknesses, and improvement suggestions.
 */
export async function analyzePerformance(
  input: PerformanceAnalyzerInput
): Promise<PerformanceAnalyzerOutput> {
  return performanceAnalyzerFlow(input);
}

/**
 * Defines the AI prompt for analyzing student performance.
 */
const performanceAnalyzerPrompt = ai.definePrompt({
  name: 'performanceAnalyzerPrompt',
  input: { schema: PerformanceAnalyzerInputSchema },
  output: { schema: PerformanceAnalyzerOutputSchema },
  prompt: `
You are an expert academic advisor bot named **"Maestro"**.
Your role is to analyze a student's academic performance based on their graded assignments and provide **encouraging, actionable feedback**.
Attendance data is not available.

Analyze the provided list of graded assignments in the input and identify patterns, strengths, and areas for improvement.

Structure your response in **Markdown** format with the following sections:
- **Overall Summary:** A brief, motivating overview of the student's overall performance.
- **Strengths:** Highlight subjects or topics where the student shows consistent excellence.
- **Areas for Improvement:** Identify subjects or assignments that require more focus.
- **Actionable Suggestions:** Provide 2–3 concrete, supportive recommendations (e.g., study methods, topic focus, or resource use).

Maintain a **positive and empathetic tone** throughout.
`,
});

/**
 * Defines the AI flow that executes the performance analysis prompt.
 */
const performanceAnalyzerFlow = ai.defineFlow(
  {
    name: 'performanceAnalyzerFlow',
    inputSchema: PerformanceAnalyzerInputSchema,
    outputSchema: PerformanceAnalyzerOutputSchema,
  },
  async (input) => {
    // ✅ Validate input
    if (!input.gradedSubmissions || input.gradedSubmissions.length === 0) {
      throw new Error('No graded submissions found. Please provide valid input.');
    }

    // 🧠 Call the AI prompt
    const { output } = await performanceAnalyzerPrompt(input);

    // ⚠️ Handle missing AI output
    if (!output) {
      throw new Error('Failed to generate performance analysis.');
    }

    return output;
  }
);

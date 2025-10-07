
'use server';
/**
 * @fileOverview This file defines the AI Performance Analyzer flow.
 * It takes a student's graded assignments as input and provides an analysis and suggestions.
 */

import { ai } from '@/ai/genkit';
import { PerformanceAnalyzerInputSchema, PerformanceAnalyzerOutputSchema, type PerformanceAnalyzerInput, type PerformanceAnalyzerOutput } from '@/lib/ai-types';

export async function analyzePerformance(input: PerformanceAnalyzerInput): Promise<PerformanceAnalyzerOutput> {
  return performanceAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
    name: 'performanceAnalyzerPrompt',
    input: { schema: PerformanceAnalyzerInputSchema },
    output: { schema: PerformanceAnalyzerOutputSchema },
    prompt: `You are an expert academic advisor bot named "Maestro". Your role is to analyze a student's performance based on their grades and provide encouraging, actionable feedback. Attendance data is not available.

Analyze the following list of graded assignments. Identify patterns, strengths, and areas for improvement.

Structure your response in Markdown format with the following sections:
- **Overall Summary:** A brief, encouraging overview of the student's performance.
- **Strengths:** Highlight courses or topics where the student is excelling.
- **Areas for Improvement:** Pinpoint specific courses or assignments where the student could improve.
- **Actionable Suggestions:** Provide a bulleted list of 2-3 specific, actionable tips to help the student improve. For example, suggest reviewing specific course materials or focusing on certain topics.

Keep the tone positive and supportive.

Graded Assignments:
\`\`\`json
${"{{JSON.stringify(input.gradedSubmissions)}}"}
\`\`\`
`,
});

const performanceAnalyzerFlow = ai.defineFlow(
  {
    name: 'performanceAnalyzerFlow',
    inputSchema: PerformanceAnalyzerInputSchema,
    outputSchema: PerformanceAnalyzerOutputSchema,
  },
  async (input) => {
    
    const { output } = await prompt(input);

    if (!output) {
      throw new Error("Failed to generate performance analysis.");
    }
    
    return output;
  }
);

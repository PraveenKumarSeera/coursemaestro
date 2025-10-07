'use server';
/**
 * @fileOverview This file defines the AI Performance Analyzer flow.
 * It takes a student's graded assignments as input and provides an analysis and suggestions.
 *
 * @exports analyzePerformance - The main function to call the flow.
 * @exports PerformanceAnalyzerInput - The input type for the analyzePerformance function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GradedSubmissionSchema = z.object({
  course: z.object({
    title: z.string(),
  }),
  assignment: z.object({
    title: z.string(),
  }),
  grade: z.number().nullable(),
});

const PerformanceAnalyzerInputSchema = z.object({
  gradedSubmissions: z.array(GradedSubmissionSchema).describe("An array of the student's graded assignments."),
});

export type PerformanceAnalyzerInput = z.infer<typeof PerformanceAnalyzerInputSchema>;

const PerformanceAnalyzerOutputSchema = z.object({
    analysis: z.string().describe('A detailed analysis of the student\'s performance, formatted as a markdown string. Include headings, bullet points, and bold text.'),
});

export async function analyzePerformance(input: PerformanceAnalyzerInput): Promise<z.infer<typeof PerformanceAnalyzerOutputSchema>> {
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
{{{jsonStringify gradedSubmissions}}}
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
    
    const { output } = await prompt({
        gradedSubmissions: input.gradedSubmissions,
    });

    if (!output) {
      throw new Error("Failed to generate performance analysis.");
    }
    
    return output;
  }
);

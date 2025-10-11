
'use server';

import { analyzePerformance } from "@/ai/flows/ai-performance-analyzer";
import type { GradedSubmission } from "@/lib/types";
import type { PerformanceAnalyzerOutput } from "@/lib/ai-types";

type ActionState = {
  analysis: string | null;
  message: string | null;
};

export async function analyzePerformanceAction(
  { gradedSubmissions }: { gradedSubmissions: GradedSubmission[] }
): Promise<ActionState> {
  
  if (!gradedSubmissions || gradedSubmissions.length === 0) {
    return {
      analysis: null,
      message: 'You do not have any graded assignments to analyze.',
    };
  }

  // Bypass AI call and return demo data
  const demoAnalysis = `
### Overall Summary
You're doing a fantastic job! You show a strong grasp of technical concepts, especially in web development, and consistently deliver high-quality work.

### Strengths
- **Advanced React Patterns:** You earned a 98% on this, which is outstanding. You clearly have a deep understanding of React.
- **Data Structures:** Your scores here are consistently high, showing a strong aptitude for algorithmic thinking.

### Areas for Improvement
- Your lowest grade was in "Introduction to Web Development". It might be beneficial to review some of the foundational HTML & CSS concepts to ensure you have a rock-solid base.

### Actionable Suggestions
1.  **Review CSS Flexbox & Grid:** Spend some time on a site like CSS-Tricks or freeCodeCamp to solidify your layout skills.
2.  **Build a Small Project:** Try building a small personal portfolio site from scratch to practice your foundational web dev skills.
3.  **Explore State Management:** Given your strength in React, you could start exploring advanced state management libraries like Redux or Zustand.
`;
  
  return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
            analysis: demoAnalysis,
            message: 'Analysis successful.',
        });
      }, 1500);
  });
}

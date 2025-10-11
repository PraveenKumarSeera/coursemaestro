
'use server';

import { analyzePerformance } from "@/ai/flows/ai-performance-analyzer";
import type { GradedSubmission } from "@/lib/types";
import type { PerformanceAnalyzerOutput } from "@/lib/ai-types";

type ActionState = {
  analysis: string | null;
  message: string | null;
};

const demoAnalysis = `
### Overall Summary
You're doing a fantastic job! Your grades show a strong dedication to your coursework, with particular excellence in technical subjects. Keep up the great momentum!

### Strengths
- **Web Development:** You consistently achieve high scores in assignments related to HTML, CSS, and React, demonstrating a natural talent for front-end technologies.
- **Problem Solving:** Your top marks in "Data Structures & Algorithms" highlight your strong analytical and problem-solving abilities.

### Areas for Improvement
- **Responsive Design:** While your web projects are functional, focusing more on mobile-first and responsive design principles could elevate your work.
- **Time Management:** Some assignments were submitted close to the deadline. Planning ahead could reduce stress and allow for more thorough reviews.

### Actionable Suggestions
1.  **Practice on Real Devices:** Test your web projects on actual mobile phones, not just browser simulators, to get a better feel for the user experience.
2.  **Explore Advanced CSS:** Look into modern CSS layouts like Grid and Flexbox to create more complex and responsive interfaces.
3.  **Start Assignments Early:** Try to start assignments the day they are announced, even if it's just outlining the work. This can make the project feel less daunting.
`;


export async function analyzePerformanceAction(
  { gradedSubmissions }: { gradedSubmissions: GradedSubmission[] }
): Promise<ActionState> {
  
  if (!gradedSubmissions || gradedSubmissions.length === 0) {
    return {
      analysis: null,
      message: 'You do not have any graded assignments to analyze.',
    };
  }

  // Return demo data
  return new Promise(resolve => {
    setTimeout(() => {
        resolve({
            analysis: demoAnalysis,
            message: 'Analysis successful.',
        });
    }, 1500);
  });
}


'use server';

import { generateResume } from "@/ai/flows/ai-resume-builder";
import type { GradedSubmission, User } from "@/lib/types";
import type { ResumeBuilderOutput } from '@/lib/ai-types';

type ActionState = {
  resumeMarkdown: string | null;
  message: string | null;
};

export async function generateResumeAction(
  { user, gradedSubmissions }: { user: User, gradedSubmissions: GradedSubmission[] }
): Promise<ActionState> {
  
  if (!gradedSubmissions || gradedSubmissions.length === 0) {
    return {
      resumeMarkdown: null,
      message: 'You need at least one graded assignment to build a resume.',
    };
  }

  const studentPerformanceData = gradedSubmissions
      .filter(sub => sub.grade && sub.grade >= 85)
      .map(sub => `Course: "${sub.course.title}", Assignment: "${sub.assignment.title}", Grade: ${sub.grade}%`)
      .join('\n');

  if (!studentPerformanceData) {
    return {
      resumeMarkdown: null,
      message: 'You need at least one assignment with a grade of 85% or higher to build a resume.',
    };
  }

  // Bypass AI call and return demo data
  const demoResume = `
# ${user.name}
**${user.email}**

---

### Summary
A highly motivated and capable student with a proven track record of excellence in technical coursework, including Web Development and Data Structures. Eager to apply strong foundational knowledge and a passion for problem-solving to a challenging role in the software industry.

---

### Education
- **Introduction to Web Development**
- **Advanced React Patterns**
- **Data Structures & Algorithms**

---

### Skills
- **Technical:** JavaScript (ES6+), React, HTML5, CSS3, Node.js, Data Structures, Algorithms
- **Soft Skills:** Problem-Solving, Team Collaboration, Communication, Fast Learner

---

### Projects / Coursework
**Project: React Hooks Application** (from *Advanced React Patterns*)
- Developed a complex single-page application utilizing React Hooks (useState, useEffect, useContext) to manage state and side effects efficiently.
- Implemented custom hooks to encapsulate reusable logic, improving code modularity and maintainability.

**Project: Algorithm Implementation** (from *Data Structures & Algorithms*)
- Implemented and benchmarked various sorting algorithms (e.g., Merge Sort, Quick Sort) to analyze their time and space complexity.
- Solved complex algorithmic problems, demonstrating a strong understanding of efficiency and optimization.
`;

  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({
            resumeMarkdown: demoResume,
            message: 'Resume generated successfully.',
        });
    }, 1500);
  });
}

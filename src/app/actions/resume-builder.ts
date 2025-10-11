
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

  const demoResume = `
# ${user.name}
**${user.email}**

---

### Summary
A highly motivated and detail-oriented student with a proven track record of excellence in technical courses, including Web Development and Data Structures. Eager to apply strong foundational knowledge in software engineering and problem-solving to a challenging internship or entry-level role.

---

### Education
*Coursework at CourseMaestro*
- Introduction to Web Development
- Advanced React Patterns
- Data Structures & Algorithms

---

### Skills
- **Programming Languages:** JavaScript, HTML, CSS, Python
- **Frameworks & Libraries:** React.js, Next.js, Tailwind CSS
- **Developer Tools:** Git, VS Code, npm
- **Soft Skills:** Problem-Solving, Team Collaboration, Communication, Time Management

---

### Projects / Coursework

**Project: Responsive Portfolio Website**
*Course: Introduction to Web Development*
- Developed a fully responsive, multi-page portfolio website using HTML, CSS, and vanilla JavaScript.
- Implemented a mobile-first design approach and utilized Flexbox and Grid for complex layouts.

**Project: E-commerce State Management**
*Course: Advanced React Patterns*
- Built a shopping cart feature for a mock e-commerce site using React's Context API for global state management.
- Optimized component rendering to prevent unnecessary re-renders and improve performance.

**Project: Algorithm Efficiency Analysis**
*Course: Data Structures & Algorithms*
- Implemented and analyzed the time and space complexity of various sorting algorithms (e.g., Merge Sort, Quick Sort).
- Wrote a report comparing the performance of different algorithms on various data sets.
  `;


  // Return demo data instead of calling AI
  return new Promise(resolve => {
    setTimeout(() => {
        resolve({
            resumeMarkdown: demoResume,
            message: 'Resume generated successfully.',
        });
    }, 1500);
  });
}

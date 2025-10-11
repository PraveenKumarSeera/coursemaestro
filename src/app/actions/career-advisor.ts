
'use server';

import { suggestCareers } from "@/ai/flows/ai-career-advisor";
import type { GradedSubmission } from "@/lib/types";
import type { CareerAdvisorOutput } from '@/lib/ai-types';

type ActionState = {
  suggestions: CareerAdvisorOutput['suggestions'] | null;
  message: string | null;
};

export async function suggestCareersAction(
  { gradedSubmissions }: { gradedSubmissions: GradedSubmission[] }
): Promise<ActionState> {
  
  if (!gradedSubmissions || gradedSubmissions.length === 0) {
    return {
      suggestions: null,
      message: 'You do not have any graded assignments to analyze for career advice.',
    };
  }

  // Bypass AI call and return demo data
  const demoSuggestions: CareerAdvisorOutput['suggestions'] = [
    {
      title: "Frontend Developer",
      description: "Based on your high performance in Web Development and React courses, a career in frontend development seems like a great fit. You seem to have a knack for building user interfaces.",
      keySkills: ["HTML", "CSS", "JavaScript", "React", "UI/UX Principles"]
    },
    {
      title: "Backend Developer",
      description: "Your strong grades in Data Structures & Algorithms suggest you have a solid foundation for backend development, which involves server-side logic and database management.",
      keySkills: ["Python/Node.js", "Databases (SQL/NoSQL)", "API Design", "System Architecture"]
    },
    {
        title: "Full-Stack Developer",
        description: "Combining your skills from both frontend and backend-related courses, you are a strong candidate for a full-stack role, working on all parts of a web application.",
        keySkills: ["Client-side Frameworks", "Server-side Logic", "Database Management", "DevOps"]
    }
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({
            suggestions: demoSuggestions,
            message: 'Analysis successful.',
        });
    }, 1500);
  });
}

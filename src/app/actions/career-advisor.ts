
'use server';

import { suggestCareers } from "@/ai/flows/ai-career-advisor";
import type { GradedSubmission } from "@/lib/types";
import type { CareerAdvisorOutput } from '@/lib/ai-types';

type ActionState = {
  suggestions: CareerAdvisorOutput['suggestions'] | null;
  message: string | null;
};

const demoSuggestions: CareerAdvisorOutput['suggestions'] = [
  {
    title: "Front-End Developer",
    description: "Your high scores in Web Development and React suggest a strong aptitude for building user interfaces. This role involves creating the visual and interactive aspects of websites and applications.",
    keySkills: ["HTML/CSS", "JavaScript", "React", "UI/UX Principles"]
  },
  {
    title: "Software Engineer (Backend)",
    description: "Your excellent performance in Data Structures & Algorithms indicates strong problem-solving and logical thinking skills, which are crucial for backend development.",
    keySkills: ["Python/Java/Node.js", "Databases", "API Design", "System Architecture"]
  },
  {
    title: "UI/UX Designer",
    description: "A strong grasp of web technologies combined with an eye for user experience could make you a great UI/UX designer, focusing on creating intuitive and visually appealing digital products.",
    keySkills: ["Figma/Sketch", "User Research", "Prototyping", "Visual Design"]
  }
];

export async function suggestCareersAction(
  { gradedSubmissions }: { gradedSubmissions: GradedSubmission[] }
): Promise<ActionState> {
  
  if (!gradedSubmissions || gradedSubmissions.length === 0) {
    return {
      suggestions: null,
      message: 'You do not have any graded assignments to analyze for career advice.',
    };
  }

  // Return demo data instead of calling the AI
  return new Promise(resolve => {
    setTimeout(() => {
        resolve({
            suggestions: demoSuggestions,
            message: 'Analysis successful.',
        });
    }, 1500);
  });
}

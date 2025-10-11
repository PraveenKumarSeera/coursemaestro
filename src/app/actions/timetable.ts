
'use server';

import { generateTimetable } from '@/ai/flows/ai-timetable-generator';
import type { Course, Assignment } from '@/lib/types';
import type { TimetableGeneratorOutput } from '@/lib/ai-types';

type ActionState = {
  schedule: TimetableGeneratorOutput['weeklySchedule'] | null;
  message: string | null;
};

export async function generateTimetableAction({
  enrolledCourses,
  upcomingAssignments,
  freeHours,
}: {
  enrolledCourses: Course[];
  upcomingAssignments: Assignment[];
  freeHours: string;
}): Promise<ActionState> {
  if (enrolledCourses.length === 0) {
    return {
      schedule: null,
      message: 'You must be enrolled in at least one course to generate a timetable.',
    };
  }

  if (!freeHours) {
    return {
      schedule: null,
      message: 'Please provide your available free hours for the week.',
    };
  }

  // Bypass AI and return demo data
  const demoSchedule: TimetableGeneratorOutput['weeklySchedule'] = [
    {
      day: "Monday",
      schedule: [
        { time: "7:00 PM - 9:00 PM", task: "Work on 'Advanced React Patterns' essay", description: "Complete the outline and research phase for the upcoming essay." }
      ]
    },
    {
      day: "Tuesday",
      schedule: [
        { time: "6:30 PM - 8:30 PM", task: "Study for 'Data Structures & Algorithms' quiz", description: "Review lecture notes on Big O notation and sorting algorithms." }
      ]
    },
    {
      day: "Wednesday",
      schedule: [
        { time: "10:00 AM - 1:00 PM", task: "Project work for 'Intro to Web Dev'", description: "Build the navigation and hero section for the final project." },
        { time: "7:00 PM - 9:00 PM", task: "Continue 'Advanced React Patterns' essay", description: "Write the first draft of the essay body." }
      ]
    },
    {
        day: "Thursday",
        schedule: []
    },
    {
        day: "Friday",
        schedule: [
            { time: "6:00 PM - 8:00 PM", task: "Final review for 'Data Structures' quiz", description: "Do practice problems and review key concepts." }
        ]
    },
    {
        day: "Saturday",
        schedule: [
             { time: "11:00 AM - 2:00 PM", task: "Finalize and submit 'Advanced React Patterns' essay", description: "Proofread, format, and submit the final version of the essay." }
        ]
    },
    {
        day: "Sunday",
        schedule: []
    }
  ];

  return new Promise((resolve) => {
      setTimeout(() => {
          resolve({
              schedule: demoSchedule,
              message: 'Timetable generated successfully.',
          });
      }, 1500)
  });
}

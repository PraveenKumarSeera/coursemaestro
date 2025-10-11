
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

  const coursesSummary = enrolledCourses
    .map((c) => c.title)
    .join(', ');

  const assignmentsSummary = upcomingAssignments
    .map((a) => `Assignment: "${a.title}" (Course: ${a.courseTitle}) is due on ${new Date(a.dueDate).toLocaleDateString()}`)
    .join('\n');

  try {
    const result = await generateTimetable({
      enrolledCourses: coursesSummary,
      upcomingAssignments: assignmentsSummary || 'No upcoming assignments.',
      freeHours,
    });
    return {
      schedule: result.weeklySchedule,
      message: 'Timetable generated successfully.',
    };
  } catch (error) {
    console.error('AI Timetable Generator Error:', error);
    return {
      schedule: null,
      message: 'There was an error generating your timetable. Please try again later.',
    };
  }
}

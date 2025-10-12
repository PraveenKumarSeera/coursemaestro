
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

  const enrolledCoursesText = enrolledCourses.map(c => c.title).join(', ');
  const assignmentsText = upcomingAssignments
    .map(a => `"${a.title}" for course "${a.courseTitle}" is due on ${a.dueDate}`)
    .join('\n');

  try {
    const result = await generateTimetable({
      enrolledCourses: enrolledCoursesText,
      upcomingAssignments: assignmentsText,
      freeHours: freeHours,
    });
    return {
      schedule: result.weeklySchedule,
      message: 'Timetable generated successfully.',
    };
  } catch (error: any) {
    return {
      schedule: null,
      message: `Failed to generate timetable: ${error.message || 'Please try again.'}`,
    };
  }
}

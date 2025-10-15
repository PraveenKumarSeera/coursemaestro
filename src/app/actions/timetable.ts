
'use server';

import type { TimetableGeneratorOutput } from '@/lib/ai-types';

type SimpleCourse = {
    id: string;
    title: string;
};

type SimpleAssignment = {
    id: string;
    title: string;
    dueDate: string;
    courseTitle: string;
};

type ActionState = {
  schedule: TimetableGeneratorOutput['weeklySchedule'] | null;
  message: string | null;
};

// --- System-Generated Timetable Logic ---
function generateSystemTimetable(
  enrolledCourses: SimpleCourse[],
  upcomingAssignments: SimpleAssignment[],
  availability: string
): TimetableGeneratorOutput['weeklySchedule'] {
    
    const schedule: TimetableGeneratorOutput['weeklySchedule'] = [];
    const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const weekend = ["Saturday", "Sunday"];
    const allDays = [...weekdays, ...weekend];

    const sortedAssignments = [...upcomingAssignments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    const tasks: { type: 'assignment' | 'study', name: string, course: string }[] = [];
    
    sortedAssignments.slice(0, 5).forEach(assignment => {
        tasks.push({ type: 'assignment', name: `Work on "${assignment.title}"`, course: assignment.courseTitle || '' });
    });
    
    enrolledCourses.forEach(course => {
        tasks.push({ type: 'study', name: `Review material for "${course.title}"`, course: course.title });
        tasks.push({ type: 'study', name: `Practice concepts from "${course.title}"`, course: course.title });
    });
    
    for (let i = tasks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tasks[i], tasks[j]] = [tasks[j], tasks[i]];
    }

    let taskIndex = 0;

    const getScheduleForDay = (day: string) => {
        let blocks = 0;
        const isWeekend = weekend.includes(day);

        switch (availability) {
            case 'evenings':
                blocks = isWeekend ? 0 : 1;
                break;
            case 'weekends':
                blocks = isWeekend ? 2 : 0;
                break;
            case 'intensive':
                blocks = isWeekend ? 2 : 1;
                break;
            case 'flexible':
            default:
                blocks = isWeekend ? 2 : (Math.random() > 0.5 ? 1 : 0);
                break;
        }
        
        const scheduleForDay: { time: string, task: string, description: string }[] = [];
        for (let i = 0; i < blocks; i++) {
            if (taskIndex >= tasks.length) break;
            const task = tasks[taskIndex];
            const time = isWeekend
              ? (i === 0 ? "10:00 AM - 12:00 PM" : "2:00 PM - 4:00 PM")
              : "7:00 PM - 9:00 PM";
            
            scheduleForDay.push({
                time,
                task: task.name,
                description: task.type === 'assignment'
                    ? `Focus on completing the main parts of this assignment.`
                    : `Solidify your understanding of key topics in ${task.course}.`,
            });
            taskIndex++;
        }
        return scheduleForDay;
    };
    
    allDays.forEach(day => {
        schedule.push({
            day,
            schedule: getScheduleForDay(day),
        });
    });

    return schedule;
}
// --- End System-Generated Logic ---

export async function generateTimetableAction({
  enrolledCourses,
  upcomingAssignments,
  availability,
}: {
  enrolledCourses: SimpleCourse[];
  upcomingAssignments: SimpleAssignment[];
  availability: string;
}): Promise<ActionState> {
  if (enrolledCourses.length === 0) {
    return {
      schedule: null,
      message: 'You must be enrolled in at least one course to generate a timetable.',
    };
  }

  if (!availability) {
    return {
      schedule: null,
      message: 'Please select your availability.',
    };
  }
  
  try {
    const result = generateSystemTimetable(enrolledCourses, upcomingAssignments, availability);
    
    await new Promise(resolve => setTimeout(resolve, 750));
    
    return {
      schedule: result,
      message: 'Timetable generated successfully.',
    };
  } catch (error: any) {
    return {
      schedule: null,
      message: `Failed to generate timetable: ${error.message || 'Please try again.'}`,
    };
  }
}

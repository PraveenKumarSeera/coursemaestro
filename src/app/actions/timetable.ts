
'use server';

import type { Course, Assignment } from '@/lib/types';
import type { TimetableGeneratorOutput } from '@/lib/ai-types';

type ActionState = {
  schedule: TimetableGeneratorOutput['weeklySchedule'] | null;
  message: string | null;
};

// --- System-Generated Timetable Logic ---
function generateSystemTimetable(
  enrolledCourses: Course[],
  upcomingAssignments: Assignment[],
  freeHours: string
): TimetableGeneratorOutput['weeklySchedule'] {
    
    const schedule: TimetableGeneratorOutput['weeklySchedule'] = [];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    // Sort assignments by due date, soonest first
    const sortedAssignments = [...upcomingAssignments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    // Create a simple list of tasks
    const tasks: { type: 'assignment' | 'study', name: string, course: string }[] = [];
    
    // Add high-priority assignment tasks
    sortedAssignments.slice(0, 3).forEach(assignment => {
        tasks.push({ type: 'assignment', name: `Work on "${assignment.title}"`, course: (assignment as any).courseTitle || '' });
    });
    
    // Add general study tasks for enrolled courses
    enrolledCourses.forEach(course => {
        tasks.push({ type: 'study', name: `Review material for "${course.title}"`, course: course.title });
        tasks.push({ type: 'study', name: `Practice concepts from "${course.title}"`, course: course.title });
    });
    
    // Shuffle tasks to vary the schedule
    for (let i = tasks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tasks[i], tasks[j]] = [tasks[j], tasks[i]];
    }

    let taskIndex = 0;
    
    days.forEach(day => {
        const dailyPlan: { day: string, schedule: { time: string, task: string, description: string }[] } = {
            day,
            schedule: [],
        };
        
        // Add 1 or 2 study blocks per day if tasks are available
        const blocksPerDay = Math.random() > 0.4 ? 2 : 1;
        for(let i = 0; i < blocksPerDay; i++) {
            if (taskIndex < tasks.length) {
                const task = tasks[taskIndex];
                const time = (i === 0) ? (Math.random() > 0.5 ? "10:00 AM - 12:00 PM" : "2:00 PM - 4:00 PM") : "7:00 PM - 8:30 PM";

                dailyPlan.schedule.push({
                    time: time,
                    task: task.name,
                    description: task.type === 'assignment' 
                        ? `Focus on completing the main parts of this assignment.` 
                        : `Solidify your understanding of key topics in ${task.course}.`,
                });
                taskIndex++;
            }
        }
        schedule.push(dailyPlan);
    });

    return schedule;
}
// --- End System-Generated Logic ---

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
  
  try {
    const result = generateSystemTimetable(enrolledCourses, upcomingAssignments, freeHours);
    
    // Simulate a short delay
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

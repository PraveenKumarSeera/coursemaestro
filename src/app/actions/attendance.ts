
'use server';

import { markAttendance } from '@/lib/data';
import { getSession } from '@/lib/session';

export async function markAttendanceAction(courseId: string) {
  const { user } = await getSession();
  if (!user || user.role !== 'student') {
    return { success: false, message: 'Only students can be marked for attendance.' };
  }

  try {
    await markAttendance(user.id, courseId);
    // We don't need to revalidate paths as this happens in the background
    return { success: true };
  } catch (error) {
    console.error('Failed to mark attendance:', error);
    return { success: false, message: 'Failed to mark attendance.' };
  }
}

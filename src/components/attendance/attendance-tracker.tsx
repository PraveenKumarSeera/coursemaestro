
'use client';

import { useEffect } from 'react';
import { markAttendanceAction } from '@/app/actions/attendance';

export default function AttendanceTracker({ courseId }: { courseId: string }) {
  useEffect(() => {
    // This action will run once when the component mounts.
    // It will only mark attendance once per day due to the logic in the action.
    markAttendanceAction(courseId);
  }, [courseId]);

  return null; // This component does not render anything
}

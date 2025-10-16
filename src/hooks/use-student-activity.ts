'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '@/lib/types';

export type ActivityStatus = 'watching' | 'submitting' | 'idle';

export type SimulatedStudent = User & {
  status: ActivityStatus;
  lastActive: Date;
};

const STATUSES: ActivityStatus[] = ['watching', 'submitting', 'idle'];
const IDLE_TIMEOUT = 2 * 60 * 1000; // 2 minutes

// This hook simulates student activity for the live progress tracker.
// In a real application, this would be replaced with a WebSocket or a real-time database connection (e.g., Firestore).
export function useStudentActivity(initialStudents: User[]) {
  const [students, setStudents] = useState<SimulatedStudent[]>(() =>
    initialStudents.map((user) => ({
      ...user,
      status: 'watching',
      lastActive: new Date(),
    }))
  );

  const updateStudentStatuses = useCallback(() => {
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        // 20% chance to change status
        if (Math.random() < 0.2) {
          const newStatus = STATUSES[Math.floor(Math.random() * STATUSES.length)];
          return {
            ...student,
            status: newStatus,
            lastActive: new Date(),
          };
        }

        // Check for idle timeout
        if (
          student.status !== 'idle' &&
          new Date().getTime() - student.lastActive.getTime() > IDLE_TIMEOUT
        ) {
          return {
            ...student,
            status: 'idle',
            // lastActive remains the same
          };
        }
        
        return student;
      })
    );
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const intervalId = setInterval(updateStudentStatuses, 3000); // Update every 3 seconds
    return () => clearInterval(intervalId);
  }, [updateStudentStatuses]);

  const summary = useMemo(() => {
    return students.reduce(
      (acc, student) => {
        acc[student.status]++;
        return acc;
      },
      { watching: 0, submitting: 0, idle: 0 }
    );
  }, [students]);

  const forceRefresh = useCallback(() => {
    setStudents(
        initialStudents.map((user) => ({
          ...user,
          status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
          lastActive: new Date(),
        }))
      );
  }, [initialStudents]);

  return { students, summary, forceRefresh };
}

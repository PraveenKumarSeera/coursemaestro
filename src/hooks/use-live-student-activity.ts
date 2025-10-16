
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { User } from '@/lib/types';
import { getSession } from '@/lib/session';

export type ActivityStatus = 'watching' | 'submitting' | 'idle';

export type LiveStudent = User & {
  status: ActivityStatus;
  lastActive: Date;
};

type ActivityBroadcast = {
    userId: string;
    name: string;
    status: ActivityStatus;
    timestamp: number;
}

const BROADCAST_KEY = 'coursemestro-activity-broadcast';
const IDLE_TIMEOUT = 2 * 60 * 1000; // 2 minutes
const PULSE_WINDOW = 15 * 1000; // 15 seconds for pulse calculation

// --- Hook for Student Side ---
export function useStudentActivityBroadcaster() {
    const broadcastActivity = useCallback(async (status: ActivityStatus) => {
        const { user } = await getSession();
        if (!user) return;

        const payload: ActivityBroadcast = {
            userId: user.id,
            name: user.name,
            status,
            timestamp: Date.now(),
        };
        
        // This triggers the 'storage' event in the teacher's browser tab
        localStorage.setItem(BROADCAST_KEY, JSON.stringify(payload));
    }, []);

    return { broadcastActivity };
}


// --- Hook for Teacher Side ---
export function useLiveStudentActivity(initialStudents: User[]) {
  const [students, setStudents] = useState<LiveStudent[]>(() =>
    initialStudents.map((user) => ({
      ...user,
      status: 'idle',
      lastActive: new Date(0), // Start with a very old date
    }))
  );
  
  const [recentPings, setRecentPings] = useState<number[]>([]);
  const [pulse, setPulse] = useState(0);

  const updateStudent = useCallback((userId: string, name: string, status: ActivityStatus, timestamp: number) => {
    setStudents(prev => {
        const studentExists = prev.some(s => s.id === userId);
        if (studentExists) {
            return prev.map(s => s.id === userId ? { ...s, status, lastActive: new Date(timestamp) } : s);
        } else {
            // This could happen if a student enrolls while teacher is watching
            return [...prev, { id: userId, name: name, email: '', role: 'student', status, lastActive: new Date(timestamp) }];
        }
    });

    // Record the ping for the pulse monitor
    if (status !== 'idle') {
        setRecentPings(prev => [...prev, timestamp]);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === BROADCAST_KEY && event.newValue) {
        try {
            const payload: ActivityBroadcast = JSON.parse(event.newValue);
            updateStudent(payload.userId, payload.name, payload.status, payload.timestamp);
        } catch (e) {
            console.error("Failed to parse activity broadcast", e);
        }
      }
    };
    
    // Check for idle students periodically
    const idleCheckInterval = setInterval(() => {
        setStudents(prev => prev.map(s => {
            if (s.status !== 'idle' && (Date.now() - s.lastActive.getTime() > IDLE_TIMEOUT)) {
                return { ...s, status: 'idle' };
            }
            return s;
        }))
    }, 5000); // Check every 5 seconds

    // Calculate pulse periodically
    const pulseInterval = setInterval(() => {
        const now = Date.now();
        const activePings = recentPings.filter(ping => now - ping < PULSE_WINDOW);
        setRecentPings(activePings);
        
        const activeStudents = new Set(students.filter(s => s.status !== 'idle').map(s => s.id)).size;
        const totalStudents = Math.max(1, students.length);
        const engagement = Math.min(100, (activeStudents / totalStudents) * 100);
        
        setPulse(engagement);
    }, 2000); // Update pulse every 2 seconds

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(idleCheckInterval);
      clearInterval(pulseInterval);
    };
  }, [updateStudent, students]);

  const summary = useMemo(() => {
    return students.reduce(
      (acc, student) => {
        if(student.status !== 'idle') {
            acc[student.status]++;
        } else {
            acc.idle++;
        }
        return acc;
      },
      { watching: 0, submitting: 0, idle: 0 }
    );
  }, [students]);

  const forceRefresh = useCallback(() => {
    // This is less meaningful in a real-time setup, but we can keep it
    // to manually re-evaluate idle status if needed.
    setStudents(prev => [...prev]);
  }, []);


  return { students, summary, forceRefresh, pulse };
}

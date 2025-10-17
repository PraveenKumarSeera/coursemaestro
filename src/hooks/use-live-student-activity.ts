
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

const BROADCAST_KEY = 'coursepilot-activity-broadcast';
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

  const updateStudentState = useCallback((userId: string, name: string, status: ActivityStatus, timestamp: number) => {
    setStudents(prev => {
        const studentExists = prev.some(s => s.id === userId);
        let newStudentList;
        if (studentExists) {
            newStudentList = prev.map(s => 
                s.id === userId ? { ...s, status, lastActive: new Date(timestamp) } : s
            );
        } else {
            // This handles the case where a student might join the session late
            newStudentList = [...prev, { id: userId, name: name, email: '', role: 'student', status, lastActive: new Date(timestamp) }];
        }
        return newStudentList;
    });

    if (status !== 'idle') {
        setRecentPings(currentPings => [...currentPings, timestamp]);
    }
  }, []);

  const handleStorageChange = useCallback((event: StorageEvent) => {
      if (event.key === BROADCAST_KEY && event.newValue) {
        try {
            const payload: ActivityBroadcast = JSON.parse(event.newValue);
            updateStudentState(payload.userId, payload.name, payload.status, payload.timestamp);
        } catch (e) {
            console.error("Failed to parse activity broadcast", e);
        }
      }
    }, [updateStudentState]);

  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    
    const idleCheckInterval = setInterval(() => {
        const now = Date.now();
        setStudents(prev => prev.map(s => {
            const isIdle = now - s.lastActive.getTime() > IDLE_TIMEOUT;
            // Only update if the status needs to change to 'idle'
            if (s.status !== 'idle' && isIdle) {
                return { ...s, status: 'idle' };
            }
            return s;
        }));
    }, 5000);

    const pulseInterval = setInterval(() => {
        const now = Date.now();
        // Filter out old pings
        const activePingsInWindow = recentPings.filter(ping => now - ping < PULSE_WINDOW);
        setRecentPings(activePingsInWindow);

        const activeStudentCount = new Set(students.filter(s => s.status !== 'idle').map(s => s.id)).size;
        const totalStudents = Math.max(1, students.length);
        
        const engagement = Math.min(100, (activeStudentCount / totalStudents) * 100);
        setPulse(engagement);
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(idleCheckInterval);
      clearInterval(pulseInterval);
    };
  }, [handleStorageChange, students.length, recentPings]);


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
    setStudents(prev => [...prev]);
  }, []);


  return { students, summary, forceRefresh, pulse };
}

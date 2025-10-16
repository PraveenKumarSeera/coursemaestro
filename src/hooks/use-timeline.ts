
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

export type TimelineEvent = {
  id: string;
  timestamp: string;
  type: 'course_enrolled' | 'lesson_completed' | 'assignment_submitted' | 'grade_received';
  title: string;
  details: string;
  icon: string;
  duration?: string;
  referenceId?: string;
};

const TIMELINE_STORAGE_KEY = 'coursepilot_timeline_events';

export function useTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      try {
        const savedEvents = localStorage.getItem(TIMELINE_STORAGE_KEY);
        if (savedEvents) {
          const parsedEvents: TimelineEvent[] = JSON.parse(savedEvents);
          // Sort by timestamp descending
          parsedEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setEvents(parsedEvents);
        }
      } catch (error) {
        console.error('Failed to load timeline events from localStorage:', error);
        setEvents([]);
      }
    }
  }, []);

  const saveEvents = useCallback((updatedEvents: TimelineEvent[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(updatedEvents));
    }
  }, []);

  const addTimelineEvent = useCallback((newEventData: Omit<TimelineEvent, 'id' | 'timestamp'>) => {
      setEvents(prevEvents => {
          const newEvent: TimelineEvent = {
              ...newEventData,
              id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: new Date().toISOString(),
          };

          const updatedEvents = [newEvent, ...prevEvents];
          saveEvents(updatedEvents);
          return updatedEvents;
      });
  }, [saveEvents]);
  
  const clearTimeline = useCallback(() => {
    setEvents([]);
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TIMELINE_STORAGE_KEY);
    }
  }, []);

  const summary = useMemo(() => {
    if (!isClient || events.length === 0) {
      return {
        activeDays: 0,
        coursesStarted: 0,
        assignmentsSubmitted: 0,
        firstEventDate: null,
      };
    }

    const uniqueDays = new Set(events.map(e => new Date(e.timestamp).toDateString()));
    const coursesStarted = events.filter(e => e.type === 'course_enrolled').length;
    const assignmentsSubmitted = events.filter(e => e.type === 'assignment_submitted').length;
    const firstEventDate = events.length > 0 ? new Date(events[events.length - 1].timestamp) : null;
    
    return {
        activeDays: uniqueDays.size,
        coursesStarted,
        assignmentsSubmitted,
        firstEventDate
    }
  }, [events, isClient]);

  return { events, addTimelineEvent, clearTimeline, summary };
}

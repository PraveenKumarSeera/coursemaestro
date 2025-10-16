
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';
import type { User, Course } from '@/lib/types';

const STUDY_ROOMS_KEY = 'study-rooms';

export interface StudyRoom {
    id: string;
    name: string;
    topic?: string;
    courseId: string;
    courseName: string;
    hostId: string;
    hostName: string;
}

export function useStudyRooms() {
    const router = useRouter();
    const { toast } = useToast();
    const [rooms, setRooms] = useState<Record<string, StudyRoom>>({});

    const updateRoomsFromStorage = useCallback(() => {
        const roomsData = localStorage.getItem(STUDY_ROOMS_KEY);
        setRooms(roomsData ? JSON.parse(roomsData) : {});
    }, []);

    useEffect(() => {
        // Initial load
        updateRoomsFromStorage();

        // Listen for changes from other tabs
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === STUDY_ROOMS_KEY) {
                updateRoomsFromStorage();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [updateRoomsFromStorage]);

    const createRoom = (
        { roomName, roomTopic, selectedCourse }: { roomName: string; roomTopic?: string; selectedCourse: { id: string; name: string } },
        user: User
    ) => {
        if (!roomName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Room name is required.' });
            return;
        }
        if (!selectedCourse) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a course.' });
            return;
        }

        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newRoom: StudyRoom = {
            id: roomId,
            name: roomName,
            topic: roomTopic,
            courseId: selectedCourse.id,
            courseName: selectedCourse.name,
            hostId: user.id,
            hostName: user.name,
        };

        const currentRooms = JSON.parse(localStorage.getItem(STUDY_ROOMS_KEY) || '{}');
        currentRooms[roomId] = newRoom;
        
        // This is the key change: Only write to storage.
        // The `storage` event listener will handle updating the state for all tabs.
        localStorage.setItem(STUDY_ROOMS_KEY, JSON.stringify(currentRooms));

        router.push(`/study-rooms/${roomId}`);
    };

    const joinRoom = (roomId: string) => {
        const allRooms = JSON.parse(localStorage.getItem(STUDY_ROOMS_KEY) || '{}');
        if (allRooms[roomId]) {
            router.push(`/study-rooms/${roomId}`);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Invalid room code.' });
        }
    };

    const getRoomsByTeacherCourses = (teacherCourses: {id: string, title: string}[]) => {
        const teacherCourseIds = new Set(teacherCourses.map(c => c.id));
        return Object.values(rooms).filter(room => teacherCourseIds.has(room.courseId));
    };
    
    return {
        rooms: Object.values(rooms),
        createRoom,
        joinRoom,
        getRoomsByTeacherCourses,
    };
}

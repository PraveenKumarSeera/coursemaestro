
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, School } from 'lucide-react';
import type { User } from '@/lib/types';

interface StudyRoom {
    id: string;
    name: string;
    topic?: string;
    courseId: string;
    courseName: string;
    hostId: string;
    hostName: string;
}

export default function TeacherDashboardClient({ teacherCourses, user }: { teacherCourses: {id: string, title: string}[], user: User }) {
    const router = useRouter();
    const [activeRooms, setActiveRooms] = useState<StudyRoom[]>([]);
    
    const teacherCourseIds = useMemo(() => new Set(teacherCourses.map(c => c.id)), [teacherCourses]);

    const updateRooms = useCallback(() => {
        const roomsData = localStorage.getItem('study-rooms');
        const allRooms: Record<string, StudyRoom> = roomsData ? JSON.parse(roomsData) : {};
        
        const relevantRooms = Object.values(allRooms).filter(room => 
            teacherCourseIds.has(room.courseId)
        );
        setActiveRooms(relevantRooms);
    }, [teacherCourseIds]);

    useEffect(() => {
        // Initial load
        updateRooms();

        // Listen for changes from other tabs
        window.addEventListener('storage', updateRooms);

        // Cleanup listener on component unmount
        return () => window.removeEventListener('storage', updateRooms);
    }, [updateRooms]);
    
    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5 text-primary" />
                    Active Study Rooms
                </CardTitle>
                <CardDescription>
                    Study rooms recently created by students in your courses.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {activeRooms.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {activeRooms.map(room => (
                            <Card key={room.id}>
                                <CardHeader>
                                    <CardTitle className="font-headline">{room.name}</CardTitle>
                                    <CardDescription>{room.courseName}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Hosted by {room.hostName}
                                    </p>
                                    <Button onClick={() => router.push(`/study-rooms/${room.id}`)} className="w-full mt-4">
                                        Join to Supervise
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">No Active Study Rooms</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            When students in your courses create study rooms, they will appear here.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

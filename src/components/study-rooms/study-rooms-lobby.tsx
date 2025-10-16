
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, LogIn, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User, Course } from '@/lib/types';
import { useStudyRooms } from '@/hooks/use-study-rooms';
import { useRouter } from 'next/navigation';

export default function StudyRoomsLobby({ user, enrolledCourses }: { user: User, enrolledCourses: Course[] }) {
    const router = useRouter();
    const { rooms: activeRooms, createRoom, joinRoom } = useStudyRooms();
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [isJoinOpen, setJoinOpen] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [roomTopic, setRoomTopic] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<{ id: string, name: string} | null>(null);
    const [joinCode, setJoinCode] = useState('');

    const handleCreateRoom = () => {
        if (selectedCourse) {
            createRoom({ roomName, roomTopic, selectedCourse }, user);
        }
    };

    const handleJoinRoom = () => {
        joinRoom(joinCode);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold font-headline">Peer Study Rooms</h1>
                    <p className="text-muted-foreground">Collaborate with your classmates in real-time.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> Create Room
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create a New Study Room</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="course">Course</Label>
                                     <Select onValueChange={(value) => {
                                        const course = enrolledCourses.find(c => c.id === value);
                                        if (course) setSelectedCourse({ id: course.id, name: course.title });
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a course for this room" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {enrolledCourses.map(course => (
                                                <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="room-name">Room Name</Label>
                                    <Input id="room-name" value={roomName} onChange={(e) => setRoomName(e.target.value)} placeholder="e.g., Mid-term Prep" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="room-topic">Topic (Optional)</Label>
                                    <Input id="room-topic" value={roomTopic} onChange={(e) => setRoomTopic(e.target.value)} placeholder="e.g., Data Structures" />
                                </div>
                                <Button onClick={handleCreateRoom} className="w-full">Create and Join</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isJoinOpen} onOpenChange={setJoinOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <LogIn className="mr-2 h-4 w-4" /> Join Room
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Join an Existing Room</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="join-code">Room Code</Label>
                                    <Input id="join-code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter 6-digit code" />
                                </div>
                                <Button onClick={handleJoinRoom} className="w-full">Join Room</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Study Rooms</CardTitle>
                    <CardDescription>Join one of the active rooms created by your peers.</CardDescription>
                </CardHeader>
                <CardContent>
                    {activeRooms.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {activeRooms.map((room) => (
                                <Card key={room.id}>
                                    <CardHeader>
                                        <CardTitle className="font-headline">{room.name}</CardTitle>
                                        <CardDescription>{room.topic || 'General Discussion'}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                                        <p>Course: {room.courseName}</p>
                                        <p>Host: {room.hostName}</p>
                                        <p>Code: <span className="font-mono bg-muted px-2 py-1 rounded">{room.id}</span></p>
                                        <Button onClick={() => router.push(`/study-rooms/${room.id}`)} className="w-full mt-2">Join Room</Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold">No Active Rooms</h3>
                            <p className="mt-2 text-sm text-muted-foreground">Be the first to create a study room!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Course, User } from '@/lib/types';
import { Loader2, PlusCircle, ArrowRight } from 'lucide-react';
import { useStudyRooms } from '@/hooks/use-study-rooms';

export default function StudyRoomsLobby({ user, enrolledCourses }: { user: User; enrolledCourses: Course[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [roomName, setRoomName] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { createRoom, rooms } = useStudyRooms();

  const handleCreateRoom = async () => {
    if (!roomName.trim() || !selectedCourseId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a room name and select a course.',
      });
      return;
    }

    setIsCreating(true);
    try {
      const course = enrolledCourses.find(c => c.id === selectedCourseId);
      if (!course) throw new Error("Course not found");

      const newRoomId = await createRoom({
        name: roomName,
        course: { id: course.id, title: course.title },
        host: { id: user.id, name: user.name },
      });
      
      toast({
        title: 'Success',
        description: 'Room created successfully! Redirecting...',
      });
      
      router.push(`/study-rooms/${newRoomId}`);

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error Creating Room',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Peer Study Rooms</h1>
        <p className="text-muted-foreground">
          Create or join a study room to collaborate with your peers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a New Study Room</CardTitle>
          <CardDescription>
            Give your room a name and choose a course to associate it with.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g., Mid-term Prep Group"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
             <Select onValueChange={setSelectedCourseId} value={selectedCourseId}>
                <SelectTrigger id="course">
                    <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                    {enrolledCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                            {course.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
           <Button onClick={handleCreateRoom} disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            Create Room
          </Button>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
            <CardTitle>Active Rooms</CardTitle>
            <CardDescription>Join a room that is already in session.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
            {rooms.length > 0 ? rooms.map(room => (
                <div key={room.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <p className="font-semibold">{room.name}</p>
                        <p className="text-sm text-muted-foreground">Course: {room.course.title} | Host: {room.host.name}</p>
                    </div>
                    <Button variant="outline" asChild>
                        <a href={`/study-rooms/${room.id}`}>
                            Join Room <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                </div>
            )) : (
                <p className="text-muted-foreground text-center py-4">No active rooms right now. Why not start one?</p>
            )}
        </CardContent>
       </Card>
    </div>
  );
}

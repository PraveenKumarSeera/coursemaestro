
'use client';

import { useState } from 'react';
import type { Course } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AiAssistant from './ai-assistant';
import { Card, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Sparkles } from 'lucide-react';

export default function AiAssistantPageClient({ courses }: { courses: Course[] }) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleCourseChange = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    setSelectedCourse(course || null);
  };

  return (
    <div className="space-y-6">
        <div className='space-y-1'>
            <h1 className="text-3xl font-bold font-headline">AI Study Assistant</h1>
            <p className="text-muted-foreground">
                Select a course to start a conversation with your AI assistant.
            </p>
        </div>

      <div className="max-w-lg">
        <Select onValueChange={handleCourseChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a course..." />
          </SelectTrigger>
          <SelectContent>
            {courses.map(course => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCourse ? (
        <AiAssistant course={selectedCourse} />
      ) : (
        <Card className="flex flex-col items-center justify-center text-center p-10 h-[580px]">
            <CardHeader>
                <div className='p-4 bg-muted rounded-full mx-auto'>
                    <Sparkles className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>No Course Selected</CardTitle>
                <CardDescription>Please select one of your enrolled courses to begin.</CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}

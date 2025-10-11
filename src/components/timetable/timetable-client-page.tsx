
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Wand2, CalendarClock, Clock, BookOpen } from 'lucide-react';
import { generateTimetableAction } from '@/app/actions/timetable';
import type { Course, Assignment } from '@/lib/types';
import type { TimetableGeneratorOutput } from '@/lib/ai-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function TimetableClientPage({
  enrolledCourses,
  upcomingAssignments,
}: {
  enrolledCourses: Course[];
  upcomingAssignments: Assignment[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState<TimetableGeneratorOutput['weeklySchedule'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [freeHours, setFreeHours] = useState('');

  const handleGeneration = async () => {
    setIsLoading(true);
    setError(null);
    setSchedule(null);

    const actionResult = await generateTimetableAction({
      enrolledCourses,
      upcomingAssignments,
      freeHours,
    });

    if (actionResult.schedule) {
      setSchedule(actionResult.schedule);
    } else {
      setError(actionResult.message || 'An unknown error occurred.');
    }

    setIsLoading(false);
  };

  const hasEnoughData = enrolledCourses.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Smart Timetable</h1>
        <p className="text-muted-foreground">
          Let AI generate a personalized study schedule for you based on your courses and availability.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Enter Your Availability</CardTitle>
          <CardDescription>
            Describe your free time for the week. Be as specific as you like. For example: "I'm free on Monday evenings after 6 PM, all day Wednesday, and weekends from 10 AM to 4 PM."
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="e.g., Weekday evenings, Weekend mornings..."
            value={freeHours}
            onChange={(e) => setFreeHours(e.target.value)}
            className="min-h-24"
          />
          {!hasEnoughData ? (
            <Alert>
              <CalendarClock className="h-4 w-4" />
              <AlertTitle>Enroll in a Course</AlertTitle>
              <AlertDescription>
                You need to be enrolled in at least one course to generate a timetable.
              </AlertDescription>
            </Alert>
          ) : (
            <Button onClick={handleGeneration} disabled={isLoading || !freeHours} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Your Schedule...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate My Timetable
                </>
              )}
            </Button>
          )}
          {error && <p className="text-destructive text-sm text-center mt-4">{error}</p>}
        </CardContent>
      </Card>

      {schedule && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold font-headline">2. Your Personalized Weekly Schedule</h2>
          <div className="space-y-8">
            {schedule.map((dailyPlan) => (
              <Card key={dailyPlan.day}>
                <CardHeader>
                  <CardTitle className="font-headline">{dailyPlan.day}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dailyPlan.schedule.length > 0 ? (
                    dailyPlan.schedule.map((block, index) => (
                      <div key={index} className="flex gap-4 p-4 border rounded-lg bg-muted/20">
                        <div className="flex flex-col items-center justify-center text-center text-primary pr-4 border-r">
                           <Clock className="h-6 w-6 mb-1" />
                           <p className="text-sm font-semibold whitespace-nowrap">{block.time}</p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-semibold flex items-center gap-2">
                               <BookOpen className="h-4 w-4 text-accent" /> 
                               {block.task}
                            </h4>
                            <p className="text-muted-foreground text-sm">{block.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No study blocks scheduled. Enjoy your free day!</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

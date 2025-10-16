
'use client';

import { useTimeline } from '@/hooks/use-timeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ThemeToggle } from '../theme-toggle';
import { Button } from '../ui/button';
import { Filter, GraduationCap, FileText, Star, Rocket } from 'lucide-react';
import { useState } from 'react';
import { format, formatDistanceToNow, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'course_enrolled' | 'assignment_submitted' | 'grade_received';

const filterConfig = [
    { type: 'all', label: 'All', icon: Filter },
    { type: 'course_enrolled', label: 'Courses', icon: GraduationCap },
    { type: 'assignment_submitted', label: 'Assignments', icon: FileText },
    { type: 'grade_received', label: 'Grades', icon: Star },
];

export default function TimelineClient() {
  const { events, clearTimeline, summary } = useTimeline();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredEvents = events.filter(event =>
    activeFilter === 'all' ? true : event.type === activeFilter
  );
  
  const journeyDuration = summary.firstEventDate ? differenceInDays(new Date(), summary.firstEventDate) + 1 : 0;

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                <Rocket className="h-8 w-8 text-primary" />
                My Learning Journey
            </h1>
            <p className="text-muted-foreground">
                Your story from beginner to explorer in {journeyDuration} {journeyDuration === 1 ? 'day' : 'days'}.
            </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={clearTimeline} size="sm">
                Reset Timeline
            </Button>
            <ThemeToggle />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Days</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{summary.activeDays}</div>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Courses Started</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{summary.coursesStarted}</div>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Assignments Done</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold">{summary.assignmentsSubmitted}</div>
              </CardContent>
          </Card>
      </div>

      <div className="space-y-4">
          <h2 className="text-xl font-bold font-headline">Timeline</h2>
          <div className="flex items-center gap-2 flex-wrap">
              {filterConfig.map(({ type, label, icon: Icon }) => (
                  <Button
                    key={type}
                    variant={activeFilter === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter(type as FilterType)}
                  >
                      <Icon className="mr-2 h-4 w-4" />
                      {label}
                  </Button>
              ))}
          </div>

          <div className="relative pl-8 py-8 before:absolute before:top-0 before:left-8 before:w-px before:h-full before:bg-border before:z-0">
              {filteredEvents.length > 0 ? (
                  filteredEvents.map((event, index) => (
                      <div key={event.id} className="relative mb-12 flex items-center gap-8">
                          <div className="absolute top-1/2 -translate-y-1/2 -left-[42px] z-10 p-2 bg-background border-2 border-primary rounded-full text-2xl">
                             {event.icon}
                          </div>
                          <div className={cn("w-full transition-all duration-500",
                              index % 2 === 0 ? "text-left" : "md:text-right md:ml-auto"
                           )}>
                               <Card className="w-full md:max-w-md shadow-md hover:shadow-lg transition-shadow">
                                  <CardHeader className="pb-2">
                                    <CardDescription>{format(new Date(event.timestamp), 'PPpp')}</CardDescription>
                                    <CardTitle className="text-lg font-headline">{event.title}</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                      <p className="text-muted-foreground">{event.details}</p>
                                  </CardContent>
                               </Card>
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="text-center text-muted-foreground py-16">
                      <p>No events to display for this filter.</p>
                      <p>Start a course or submit an assignment to begin your journey!</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}

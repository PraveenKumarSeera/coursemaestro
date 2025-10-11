'use client';
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, User } from 'lucide-react';
import type { Course } from '@/lib/types';
import { cn } from '@/lib/utils';

type CourseNodeData = {
  course: Course;
  isEnrolled: boolean;
  isTeacher: boolean;
};

const CourseNode = memo(({ data, selected }: NodeProps<CourseNodeData>) => {
  const { course, isEnrolled, isTeacher } = data;
  return (
    <Card className={cn("w-64 border-2 shadow-lg", selected ? "border-primary shadow-primary/30" : "border-border")}>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
      <CardHeader>
        {isEnrolled && !isTeacher && <Badge className="absolute -top-2 -right-2">Enrolled</Badge>}
        {isTeacher && <Badge variant="secondary" className="absolute -top-2 -right-2">My Course</Badge>}
        <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-full">
                <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-headline text-lg leading-tight">{course.title}</CardTitle>
        </div>
        <CardDescription className="text-xs pt-2 line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
    </Card>
  );
});

CourseNode.displayName = 'CourseNode';

export default CourseNode;

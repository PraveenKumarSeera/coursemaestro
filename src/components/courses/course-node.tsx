'use client';
import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
    <>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary"
      />
      <Card
        className={cn(
          'w-64 border-2 shadow-lg hover:shadow-xl transition-shadow duration-200',
          selected ? 'border-primary shadow-primary/30' : 'border-border'
        )}
      >
        <CardHeader>
          {isEnrolled && !isTeacher && (
            <Badge className="absolute -top-2 -right-2">Enrolled</Badge>
          )}
          {isTeacher && (
            <Badge variant="secondary" className="absolute -top-2 -right-2">
              My Course
            </Badge>
          )}
          <div className="flex items-start gap-3">
            <div className="p-3 bg-muted rounded-full">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="font-headline text-lg leading-tight">
                {course.title}
              </CardTitle>
              <CardDescription className="text-xs pt-1 line-clamp-2">
                {course.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
    </>
  );
});

CourseNode.displayName = 'CourseNode';

export default CourseNode;

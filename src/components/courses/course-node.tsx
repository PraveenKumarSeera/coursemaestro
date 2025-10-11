
'use client';
import { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, ExternalLink } from 'lucide-react';
import type { Course } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type CourseNodeData = {
  course: Course;
  isEnrolled: boolean;
  isTeacher: boolean;
};

const CourseNode = memo(({ data, selected, id }: NodeProps<CourseNodeData>) => {
  const { course, isEnrolled, isTeacher } = data;
  const router = useRouter();
  const { fitView } = useReactFlow();

  const handleDoubleClick = () => {
    router.push(`/courses/${id}`);
  };

  return (
    <>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary opacity-0"
      />
      <Card
        className={cn(
          'w-72 border-2 shadow-lg hover:shadow-primary/20 transition-shadow duration-200 cursor-pointer',
          selected ? 'border-primary shadow-primary/30' : 'border-border'
        )}
        onDoubleClick={handleDoubleClick}
      >
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-muted rounded-lg mt-1">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="font-headline text-lg leading-tight mb-1">
                {course.title}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-2">
                {course.description}
              </CardDescription>
            </div>
          </div>
           <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                {isTeacher ? (
                    <Badge variant="secondary">My Course</Badge>
                ) : isEnrolled ? (
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enrolled
                    </Badge>
                ) : (
                     <Badge variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Details
                    </Badge>
                )}
                <span>Click to expand</span>
           </div>
        </CardHeader>
      </Card>
      <Handle type="target" position={Position.Top} className="!bg-primary opacity-0" />
    </>
  );
});

CourseNode.displayName = 'CourseNode';

export default CourseNode;

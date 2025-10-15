
'use client';

import { useState } from 'react';
import type { GradedSubmission } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateTargetedPracticeAction } from '@/app/actions/targeted-practice';
import { Loader2, Wand2, RefreshCw, Target } from 'lucide-react';
import { format } from 'date-fns';

type TargetedPracticeClientProps = {
  submissions: GradedSubmission[];
};

export default function TargetedPracticeClient({ submissions }: TargetedPracticeClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [microLesson, setMicroLesson] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState<GradedSubmission | null>(null);

  const handleGenerate = async (submission: GradedSubmission) => {
    setIsLoading(true);
    setError(null);
    setMicroLesson(null);
    setCurrentSubmission(submission);
    setIsOpen(true);

    const result = await generateTargetedPracticeAction({
      courseTitle: submission.course.title,
      assignmentTitle: submission.assignment.title,
      grade: submission.grade || 0,
    });

    if (result.microLesson) {
      setMicroLesson(result.microLesson);
    } else {
      setError(result.message || 'An unknown error occurred.');
    }
    setIsLoading(false);
  };
  
  const handleRetry = () => {
    if (currentSubmission) {
      handleGenerate(currentSubmission);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Practice Opportunities</CardTitle>
          <CardDescription>
            Click "Generate Practice" on any assignment below to get a personalized micro-lesson.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-muted/20"
            >
              <div className="flex items-center gap-4">
                 <div className="p-2 bg-background rounded-full">
                    <Target className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold">{sub.assignment.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Course: {sub.course.title} | Grade: <span className="font-bold text-destructive">{sub.grade}%</span>
                  </p>
                </div>
              </div>
              <Button onClick={() => handleGenerate(sub)} variant="secondary" size="sm">
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Practice
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Targeted Practice Session</DialogTitle>
            <DialogDescription>
              A personalized lesson from your AI tutor to help you master this topic.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {isLoading ? (
              <div className="text-center space-y-2 min-h-[250px] flex flex-col justify-center items-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Building your practice session...</p>
              </div>
            ) : error ? (
              <div className="text-center space-y-4 min-h-[250px] flex flex-col justify-center items-center">
                <p className="text-destructive text-sm">{error}</p>
                <Button variant="outline" onClick={handleRetry}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            ) : microLesson ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: microLesson.replace(/\n/g, '<br />') }}
              />
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

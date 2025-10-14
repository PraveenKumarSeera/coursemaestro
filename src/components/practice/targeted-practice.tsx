
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Wand2, RefreshCw } from 'lucide-react';
import { generateTargetedPracticeAction } from '@/app/actions/targeted-practice';

export default function TargetedPractice({
  courseTitle,
  assignmentTitle,
  grade,
}: {
  courseTitle: string;
  assignmentTitle: string;
  grade: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [microLesson, setMicroLesson] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setMicroLesson(null);
    setIsOpen(true);

    const result = await generateTargetedPracticeAction({ courseTitle, assignmentTitle, grade });

    if (result.microLesson) {
      setMicroLesson(result.microLesson);
    } else {
      setError(result.message || 'An unknown error occurred.');
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="border-t pt-4">
        <Button onClick={handleGenerate} variant="secondary" size="sm" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Generate Targeted Practice
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Let AI create a mini-lesson to help you improve on this topic.
        </p>
      </div>

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
                    <Button variant="outline" onClick={handleGenerate}>
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

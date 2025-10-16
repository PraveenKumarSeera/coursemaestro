'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLiveQuiz } from '@/hooks/use-live-quiz';
import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LiveQuizTaker() {
  const { quizState, submitAnswer } = useLiveQuiz();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  useEffect(() => {
    // Reset local component state when the global quiz state becomes inactive
    if (!quizState.isActive) {
      setSelectedAnswer(null);
      setIsSubmitted(false);
    }
  }, [quizState.isActive]);
  
  const handleSubmit = () => {
    if (selectedAnswer && quizState.question) {
      submitAnswer(quizState.question.id, selectedAnswer);
      setIsSubmitted(true);
    }
  };

  if (!quizState.isActive || !quizState.question) {
    return null;
  }

  return (
    <Dialog open={quizState.isActive} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{quizState.question.question}</DialogTitle>
          <DialogDescription>
            Select one of the options below. The quiz will end soon!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          {quizState.question.options.map((option) => (
            <Button
              key={option}
              variant={selectedAnswer === option ? 'default' : 'outline'}
              className="w-full justify-start h-auto py-3"
              onClick={() => !isSubmitted && setSelectedAnswer(option)}
              disabled={isSubmitted}
            >
                {selectedAnswer === option && <Check className="mr-2 h-4 w-4" />}
                {option}
            </Button>
          ))}
        </div>
        <DialogFooter className="sm:justify-between items-center">
            <div className="font-bold text-2xl">
                Time left: {quizState.timer}s
            </div>
            {!isSubmitted ? (
                <Button onClick={handleSubmit} disabled={!selectedAnswer}>
                    Submit Answer
                </Button>
            ) : (
                <p className="text-sm text-green-600 font-semibold flex items-center gap-2">
                    <Check className="h-4 w-4" /> Answer submitted!
                </p>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

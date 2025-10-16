
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
  const { toast } = useToast();

  useEffect(() => {
    if (!quizState.isActive) {
      // Reset state when quiz ends
      setSelectedAnswer(null);
      setIsSubmitted(false);
    }
  }, [quizState.isActive]);
  
  const playQuizSound = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (!context) return;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(440, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.3);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.3);
    } catch (e) {
      console.error("Failed to play sound", e);
    }
  };


  useEffect(() => {
    if (quizState.isActive) {
        playQuizSound();
        toast({
            title: "Live Quiz Started!",
            description: "Your teacher has launched a live quiz.",
        });
    }
  }, [quizState.isActive, toast]);


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

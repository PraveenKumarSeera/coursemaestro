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
import { Loader2, Wand2, Sparkles, Languages } from 'lucide-react';
import { analyzeSubmissionAction } from '@/app/actions/teaching-assistant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

type Task = 'summarize' | 'grammarCheck';

export default function AITeachingAssistant({ submissionText }: { submissionText: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const handleAnalyze = async (task: Task) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setCurrentTask(task);
    setIsOpen(true);

    const result = await analyzeSubmissionAction(submissionText, task);
    
    if (result.analysis) {
      setAnalysis(result.analysis);
    } else {
      setError(result.message || 'An unknown error occurred.');
    }
    setIsLoading(false);
  };

  const getDialogTitle = () => {
    if (currentTask === 'summarize') return 'AI Summary';
    if (currentTask === 'grammarCheck') return 'AI Grammar & Style Check';
    return 'AI Teaching Assistant';
  }

  return (
    <>
      <Card className="bg-background">
        <CardHeader className="flex-row items-center justify-between pb-4">
            <div className="space-y-1">
                <CardTitle className="text-base flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-accent" />
                    <span>AI Assistant</span>
                </CardTitle>
                <CardDescription className="text-xs">
                    Analyze this submission with AI.
                </CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleAnalyze('summarize')}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Summarize
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAnalyze('grammarCheck')}>
                    <Languages className="mr-2 h-4 w-4" />
                    Check Grammar
                </Button>
            </div>
        </CardHeader>
      </Card>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogDescription>
              AI-powered analysis of the student's submission.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 min-h-[200px] flex items-center justify-center">
            {isLoading ? (
                <div className='text-center space-y-2'>
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className='text-muted-foreground'>Analyzing submission...</p>
                </div>
            ) : analysis ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />
            ) : (
              error && <p className="text-destructive text-sm text-center">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

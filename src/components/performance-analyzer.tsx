'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Loader2, Wand2 } from 'lucide-react';
import { analyzePerformanceAction } from '@/app/actions/performance-analyzer';
import type { GradedSubmission } from '@/lib/types';

export default function PerformanceAnalyzer({ gradedSubmissions }: { gradedSubmissions: GradedSubmission[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const result = await analyzePerformanceAction({ gradedSubmissions });
    
    if (result.analysis) {
        setAnalysis(result.analysis);
    } else {
        setError(result.message || 'An unknown error occurred.');
    }
    setIsLoading(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Wand2 className="mr-2 h-4 w-4" />
          Analyze My Performance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Performance Analysis</DialogTitle>
          <DialogDescription>
            Get personalized feedback on your academic performance from our AI assistant.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
            {analysis ? (
                <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />
            ) : (
                <div className='flex justify-center'>
                    <Button onClick={handleAnalyze} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            'Start Analysis'
                        )}
                    </Button>
                </div>
            )}
             {error && <p className="text-destructive text-sm text-center">{error}</p>}
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

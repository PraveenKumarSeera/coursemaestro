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
import type { GradedSubmission, User } from '@/lib/types';
import { Badge } from './ui/badge';

export default function PerformanceAnalyzer({ user, gradedSubmissions }: { user: User, gradedSubmissions: GradedSubmission[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{ summary: string; strengths: string[]; improvements: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const result = await analyzePerformanceAction({ studentName: user.name, gradedSubmissions });
    
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
        <div className="py-4 space-y-4 min-h-[250px] flex items-center justify-center">
            {isLoading ? (
                 <div className='text-center space-y-2'>
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                    <p className='text-muted-foreground'>Analyzing your performance...</p>
                </div>
            ) : analysis ? (
                <div className="space-y-4 text-left">
                    <div>
                        <h3 className="font-semibold mb-2">Overall Summary</h3>
                        <p className="text-muted-foreground">{analysis.summary}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Key Strengths</h3>
                        <div className="flex flex-wrap gap-2">
                           {analysis.strengths.map(skill => <Badge key={skill} variant="secondary" className="bg-green-100 text-green-800">{skill}</Badge>)}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Areas for Improvement</h3>
                        <div className="flex flex-wrap gap-2">
                            {analysis.improvements.map(skill => <Badge key={skill} variant="secondary" className="bg-yellow-100 text-yellow-800">{skill}</Badge>)}
                        </div>
                    </div>
                </div>
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

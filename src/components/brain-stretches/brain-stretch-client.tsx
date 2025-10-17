
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Wand2, BrainCircuit, Check, X, RefreshCw } from 'lucide-react';
import { generateBrainStretchesAction } from '@/app/actions/brain-stretches';
import { BrainStretchPuzzle } from '@/lib/ai-types';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function BrainStretchClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [puzzles, setPuzzles] = useState<BrainStretchPuzzle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setPuzzles([]);
    setAnswers({});
    setShowResults(false);

    const result = await generateBrainStretchesAction();
    if (result.puzzles) {
      setPuzzles(result.puzzles);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    handleGenerate();
  }, []);
  
  const handleAnswerSelect = (puzzleIndex: number, option: string) => {
    setAnswers(prev => ({ ...prev, [puzzleIndex]: option }));
  }
  
  const handleSubmit = () => {
    setShowResults(true);
  }

  const puzzleTypeNames = {
    'odd-one-out': 'Odd One Out',
    analogy: 'Analogy',
    anagram: 'Anagram',
  };

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue='item-1'>
      <AccordionItem value="item-1">
        <AccordionTrigger>
             <div className="flex items-center gap-3">
                <BrainCircuit className="h-6 w-6 text-primary" />
                <div className='text-left'>
                    <h2 className="text-xl font-bold font-headline">Brain Stretches</h2>
                    <p className="text-sm text-muted-foreground">Test your knowledge with these quick puzzles.</p>
                </div>
            </div>
        </AccordionTrigger>
        <AccordionContent>
           <Card className="border-none">
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <CardDescription>A fresh set of puzzles to boost your reasoning and memory.</CardDescription>
                         <Button onClick={handleGenerate} variant="outline" size="sm" disabled={isLoading}>
                            {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            New Puzzles
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center text-center p-10 min-h-[200px]">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <h2 className="text-lg font-semibold mt-4">Generating Puzzles...</h2>
                        </div>
                    )}
                    
                    {error && <p className="text-destructive text-sm text-center">{error}</p>}

                    {!isLoading && puzzles.length > 0 && (
                        <div className="space-y-6">
                        {puzzles.map((puzzle, index) => (
                            <Card key={index} className="bg-muted/30">
                                <CardHeader>
                                    <CardTitle className='text-md flex items-center justify-between'>
                                        <span>{index + 1}. {puzzle.question}</span>
                                        <Badge variant="outline">{puzzleTypeNames[puzzle.type]}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {puzzle.options.map((option) => {
                                        const isSelected = answers[index] === option;
                                        const isCorrect = showResults && puzzle.answer === option;
                                        const isIncorrect = showResults && isSelected && puzzle.answer !== option;
                                        return (
                                            <Button
                                                key={option}
                                                variant="outline"
                                                className={cn(
                                                    'h-auto py-3 justify-start',
                                                    isSelected && !showResults && 'bg-primary/10 border-primary',
                                                    isCorrect && 'bg-green-100/80 border-green-500 text-green-800 hover:bg-green-100/90 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700',
                                                    isIncorrect && 'bg-red-100/80 border-red-500 text-red-800 hover:bg-red-100/90 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700'
                                                )}
                                                onClick={() => !showResults && handleAnswerSelect(index, option)}
                                            >
                                                {isCorrect && <Check className="mr-2 h-4 w-4" />}
                                                {isIncorrect && <X className="mr-2 h-4 w-4" />}
                                                {option}
                                            </Button>
                                        );
                                    })}
                                </CardContent>
                                {showResults && (
                                    <CardContent>
                                    <p className="text-sm text-muted-foreground p-2 bg-background rounded-md">
                                        <span className='font-semibold'>Explanation:</span> {puzzle.explanation}
                                    </p>
                                </CardContent>
                                )}
                            </Card>
                        ))}
                        {!showResults && (
                            <div className="text-center">
                                <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== puzzles.length}>
                                    Check My Answers
                                </Button>
                                {Object.keys(answers).length !== puzzles.length && <p className="text-xs text-muted-foreground mt-2">Please answer all questions.</p>}
                            </div>
                        )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

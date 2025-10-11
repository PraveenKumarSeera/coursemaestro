
'use client';

import { useState } from 'react';
import type { Course } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Wand2, BrainCircuit, Check, X } from 'lucide-react';
import { generateBrainStretchesAction } from '@/app/actions/brain-stretches';
import { BrainStretchPuzzle } from '@/lib/ai-types';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

export default function BrainStretchClient({ courses }: { courses: Course[] }) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [puzzles, setPuzzles] = useState<BrainStretchPuzzle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

  const handleCourseChange = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    setSelectedCourse(course || null);
    setPuzzles([]);
    setAnswers({});
    setShowResults(false);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!selectedCourse) return;
    setIsLoading(true);
    setError(null);
    setPuzzles([]);
    setAnswers({});
    setShowResults(false);

    const result = await generateBrainStretchesAction(selectedCourse);
    if (result.puzzles) {
      setPuzzles(result.puzzles);
    } else {
      setError(result.message);
    }
    setIsLoading(false);
  };
  
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
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Brain Stretches</h1>
        <p className="text-muted-foreground">
          Boost your reasoning and memory with AI-powered puzzles based on your courses.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select a Course</CardTitle>
          <CardDescription>
            Choose one of your enrolled courses to generate brain stretch puzzles.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <Select onValueChange={handleCourseChange} disabled={isLoading}>
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Select a course..." />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate} disabled={!selectedCourse || isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate Puzzles
          </Button>
        </CardContent>
      </Card>
      
      {error && <p className="text-destructive text-sm text-center">{error}</p>}

      {puzzles.length > 0 && (
        <div className="space-y-6">
          {puzzles.map((puzzle, index) => (
            <Card key={index}>
              <CardHeader>
                 <CardTitle className='text-lg flex items-center justify-between'>
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
                                isCorrect && 'bg-green-100/80 border-green-500 text-green-800 hover:bg-green-100/90',
                                isIncorrect && 'bg-red-100/80 border-red-500 text-red-800 hover:bg-red-100/90'
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
                    <p className="text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
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

      {!isLoading && puzzles.length === 0 && (
         <Card className="flex flex-col items-center justify-center text-center p-10 min-h-[200px]">
            <CardHeader>
                <div className='p-4 bg-muted rounded-full mx-auto'>
                    <BrainCircuit className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>Ready to Stretch Your Brain?</CardTitle>
                <CardDescription>Select a course and generate your puzzles to get started.</CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}

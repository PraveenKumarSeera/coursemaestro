
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Rocket, Send, Trash2 } from 'lucide-react';
import { useLiveQuiz, type QuizQuestion } from '@/hooks/use-live-quiz';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export default function InstantQuizLauncher({ studentCount }: { studentCount: number }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '']);
  const { launchQuiz, endQuiz, quizState, responses } = useLiveQuiz();
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  }

  const handleLaunch = () => {
    if (question.trim() && options.every(o => o.trim())) {
      launchQuiz({
        id: `quiz-${Date.now()}`,
        question,
        options,
      }, 30); // 30-second timer
    }
  };

  if (quizState.isActive) {
    const totalResponses = Object.keys(responses).length;
    const chartData = quizState.question?.options.map((option, index) => {
        const count = Object.values(responses).filter(res => res.answer === option).length;
        return { name: `Option ${index + 1}`, responses: count };
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Quiz Results</CardTitle>
          <CardDescription>{quizState.question?.question}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-40">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" hide />
                <Bar dataKey="responses" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2 text-sm">
            {quizState.question?.options.map((option, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{index + 1}. {option}</span>
                <span className="font-bold">{chartData?.[index].responses || 0}</span>
              </li>
            ))}
          </ul>
           <div className="text-center pt-4 space-y-2">
                <p className="font-bold text-4xl">{quizState.timer}</p>
                <p className="text-sm text-muted-foreground">{totalResponses} of {studentCount} students have responded.</p>
           </div>
          <Button onClick={endQuiz} variant="destructive" className="w-full">End Quiz Now</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Rocket className="h-5 w-5 text-primary" />
          <span>Instant Quiz Launcher</span>
        </CardTitle>
        <CardDescription>
          Launch a multiple-choice quiz to all active students.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="question">Question</Label>
          <Input
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What is the capital of France?"
          />
        </div>
        <div className="space-y-2">
          <Label>Options</Label>
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
                <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && <Button variant="ghost" size="icon" onClick={() => removeOption(index)}><Trash2 className="h-4 w-4" /></Button>}
            </div>
          ))}
        </div>
        <div className='flex justify-between items-center'>
            <Button variant="outline" size="sm" onClick={addOption} disabled={options.length >= 4}>
                <Plus className="mr-2 h-4 w-4" /> Add Option
            </Button>
            <Button onClick={handleLaunch} disabled={!question.trim() || options.some(o => !o.trim())}>
                <Send className="mr-2 h-4 w-4" /> Launch Quiz
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

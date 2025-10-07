
'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { askAI } from '@/app/actions/ai';
import type { Course } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, User, Bot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        'Send'
      )}
    </Button>
  );
}

export default function AiAssistant({ course }: { course: Course }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const courseMaterial = `${course.title}: ${course.description}`;
  
  const [state, dispatch] = useActionState(askAI, {
    answer: '',
    question: '',
  });

  useEffect(() => {
    if (state.answer) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: state.question },
        { role: 'assistant', content: state.answer },
      ]);
      formRef.current?.reset();
    }
  }, [state]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A bit of a hack to scroll to the bottom. In a real app, use a more robust solution.
        setTimeout(() => {
            const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }
  }, [messages]);

  return (
    <Card className="h-full flex flex-col">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                <span>AI Study Assistant</span>
            </CardTitle>
        </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-full">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3 text-sm">
                <p>Hello! How can I help you with {course.title} today?</p>
              </div>
            </div>
            {messages.map((message, index) => (
              <div key={index} className="flex items-start gap-3">
                 {message.role === 'user' ? (
                    <>
                        <div className="p-2 bg-primary/10 rounded-full">
                            <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="bg-primary/10 rounded-lg p-3 text-sm">
                            <p>{message.content}</p>
                        </div>
                    </>
                 ) : (
                    <>
                        <div className="p-2 bg-muted rounded-full">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div className="bg-muted rounded-lg p-3 text-sm">
                            <p>{message.content}</p>
                        </div>
                    </>
                 )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form ref={formRef} action={dispatch} className="flex w-full items-center space-x-2">
          <input type="hidden" name="courseMaterial" value={courseMaterial} />
          <Input
            name="studentQuestion"
            placeholder="Ask a question about the course..."
            autoComplete="off"
            required
          />
          <SubmitButton />
        </form>
      </CardFooter>
    </Card>
  );
}


'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sun, Moon, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type Emoji = '😕' | '🤓' | '😍' | '😴';
type Mood = {
  emoji: Emoji;
  name: string;
};
type ReactionCounts = Record<Emoji, number>;

const moods: Mood[] = [
  { emoji: '😕', name: 'Confused' },
  { emoji: '🤓', name: 'Engaged' },
  { emoji: '😍', name: 'Loving it' },
  { emoji: '😴', name: 'Tired' },
];

const initialCounts: ReactionCounts = { '😕': 0, '🤓': 0, '😍': 0, '😴': 0 };

export default function ClassroomMoodClient() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [counts, setCounts] = useState<ReactionCounts>(initialCounts);
  const [userSelection, setUserSelection] = useState<Emoji | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load saved state from local storage
    const savedTheme = localStorage.getItem('mood-cloud-theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }

    const savedCounts = localStorage.getItem('mood-cloud-counts');
    if (savedCounts) {
      setCounts(JSON.parse(savedCounts));
    }

    const savedSelection = localStorage.getItem('mood-cloud-selection') as Emoji | null;
    if (savedSelection) {
      setUserSelection(savedSelection);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('mood-cloud-theme', theme);
    }
  }, [theme, isClient]);

   useEffect(() => {
    if (isClient) {
      localStorage.setItem('mood-cloud-counts', JSON.stringify(counts));
    }
  }, [counts, isClient]);

   useEffect(() => {
    if (isClient) {
        if (userSelection) {
            localStorage.setItem('mood-cloud-selection', userSelection);
        } else {
            localStorage.removeItem('mood-cloud-selection');
        }
    }
   }, [userSelection, isClient]);


  const handleReaction = (emoji: Emoji) => {
    setCounts(prevCounts => {
      const newCounts = { ...prevCounts };
      
      // If user is changing their reaction
      if (userSelection && userSelection !== emoji) {
        newCounts[userSelection] = Math.max(0, newCounts[userSelection] - 1);
      }
      
      // If user is deselecting
      if (userSelection === emoji) {
         newCounts[emoji] = Math.max(0, newCounts[emoji] - 1);
         setUserSelection(null);
      } else { // If new selection or changing selection
        newCounts[emoji] += 1;
        setUserSelection(emoji);
      }

      return newCounts;
    });
  };

  const handleReset = () => {
    setCounts(initialCounts);
    setUserSelection(null);
  };

  const toggleTheme = () => {
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  const dominantMood = useMemo(() => {
    const totalReactions = Object.values(counts).reduce((sum, count) => sum + count, 0);
    if (totalReactions === 0) return { name: 'Neutral', emoji: '😊' };

    let maxCount = -1;
    let dominantEmoji: Emoji | null = null;
    for (const emoji of (Object.keys(counts) as Emoji[])) {
      if (counts[emoji] > maxCount) {
        maxCount = counts[emoji];
        dominantEmoji = emoji;
      }
    }
    return moods.find(m => m.emoji === dominantEmoji) || { name: 'Mixed', emoji: '🤔' };
  }, [counts]);
  
  const floatingEmojis = useMemo(() => {
    const totalReactions = Math.max(1, Object.values(counts).reduce((sum, count) => sum + count, 0));
    return moods.flatMap(({ emoji }) => 
        Array(counts[emoji]).fill(null).map((_, i) => {
            const size = 30 + (counts[emoji] / totalReactions) * 100; // Base size + percentage of total
            const opacity = 0.4 + (counts[emoji] / totalReactions) * 0.6;
            return {
                id: `${emoji}-${i}`,
                emoji,
                style: {
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${10 + Math.random() * 10}s`,
                    animationDelay: `${Math.random() * 5}s`,
                    fontSize: `${Math.min(100, size)}px`,
                    opacity: Math.min(1, opacity)
                }
            }
        })
    );
  }, [counts]);

  if (!isClient) {
    return null; // Or a skeleton loader
  }

  return (
    <div className={cn("min-h-screen w-full bg-background text-foreground transition-colors", theme)}>
       <style jsx global>{`
        .emoji-cloud {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
        }
        .floating-emoji {
            position: absolute;
            bottom: -150px;
            animation: float-up linear infinite;
        }
        @keyframes float-up {
            0% {
                transform: translateY(0);
            }
            100% {
                transform: translateY(-120vh);
            }
        }
      `}</style>

      <main className="container mx-auto py-8 px-4 relative z-10">
        <Card className="max-w-4xl mx-auto border-2">
            <div className="emoji-cloud" aria-hidden="true">
                {floatingEmojis.map(item => (
                    <span key={item.id} className="floating-emoji" style={item.style}>
                        {item.emoji}
                    </span>
                ))}
            </div>

          <CardHeader className="text-center relative">
            <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="outline" size="icon" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Reset Reactions</span>
                </Button>
                <Button variant="outline" size="icon" onClick={toggleTheme}>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
            <CardTitle className="text-3xl font-bold font-headline">Classroom Mood Cloud</CardTitle>
            <CardDescription>React to the lecture in real-time and see the collective mood!</CardDescription>
          </CardHeader>
          <CardContent className="py-10 space-y-12 relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {moods.map(({ emoji, name }) => (
                <div key={emoji} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => handleReaction(emoji)}
                    className={cn(
                      "text-6xl rounded-full p-2 transition-all duration-200 transform hover:scale-110",
                      userSelection === emoji ? 'bg-foreground/10 scale-110' : 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100'
                    )}
                  >
                    {emoji}
                  </button>
                  <span className="font-bold text-2xl">{counts[emoji]}</span>
                  <span className="text-sm text-muted-foreground">{name}</span>
                </div>
              ))}
            </div>

            <div className="text-center border-t pt-6">
                <p className="text-lg text-muted-foreground">
                    Current Class Mood: <span className="font-bold text-xl text-foreground">{dominantMood.name}</span>
                    <span className='text-2xl ml-2'>{dominantMood.emoji}</span>
                </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

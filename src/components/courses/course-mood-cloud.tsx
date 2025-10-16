
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '../theme-provider';

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

export default function CourseMoodCloud({ courseId }: { courseId: string }) {
  const { theme } = useTheme();
  const [counts, setCounts] = useState<ReactionCounts>(initialCounts);
  const [userSelection, setUserSelection] = useState<Emoji | null>(null);
  const [isClient, setIsClient] = useState(false);

  const storageKeys = {
      counts: `mood-cloud-counts-${courseId}`,
      selection: `mood-cloud-selection-${courseId}`,
  };

  useEffect(() => {
    setIsClient(true);
    // Load saved state from local storage
    const savedCounts = localStorage.getItem(storageKeys.counts);
    if (savedCounts) {
      setCounts(JSON.parse(savedCounts));
    }

    const savedSelection = localStorage.getItem(storageKeys.selection) as Emoji | null;
    if (savedSelection) {
      setUserSelection(savedSelection);
    }
  }, [courseId, storageKeys.counts, storageKeys.selection]);

   useEffect(() => {
    if (isClient) {
      localStorage.setItem(storageKeys.counts, JSON.stringify(counts));
    }
  }, [counts, isClient, storageKeys.counts]);

   useEffect(() => {
    if (isClient) {
        if (userSelection) {
            localStorage.setItem(storageKeys.selection, userSelection);
        } else {
            localStorage.removeItem(storageKeys.selection);
        }
    }
   }, [userSelection, isClient, storageKeys.selection]);


  const handleReaction = (emoji: Emoji) => {
    setCounts(prevCounts => {
      const newCounts = { ...prevCounts };
      
      if (userSelection && userSelection !== emoji) {
        newCounts[userSelection] = Math.max(0, newCounts[userSelection] - 1);
      }
      
      if (userSelection === emoji) {
         newCounts[emoji] = Math.max(0, newCounts[emoji] - 1);
         setUserSelection(null);
      } else {
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
            const size = 30 + (counts[emoji] / totalReactions) * 100;
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
    <div className={cn("min-h-[60vh] w-full bg-background text-foreground transition-colors relative overflow-hidden rounded-lg border", theme)}>
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

        <Card className="h-full w-full border-none shadow-none bg-transparent">
            <div className="emoji-cloud" aria-hidden="true">
                {floatingEmojis.map(item => (
                    <span key={item.id} className="floating-emoji" style={item.style}>
                        {item.emoji}
                    </span>
                ))}
            </div>

          <CardHeader className="text-center relative z-10">
            <div className="absolute top-4 right-4 flex gap-2">
                <Button variant="outline" size="icon" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Reset Reactions</span>
                </Button>
            </div>
            <CardTitle className="text-3xl font-bold font-headline">Classroom Mood Cloud</CardTitle>
            <CardDescription>React to the lecture in real-time!</CardDescription>
          </CardHeader>
          <CardContent className="py-10 space-y-12 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto">
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

            <div className="text-center border-t pt-6 max-w-lg mx-auto">
                <p className="text-lg text-muted-foreground">
                    Current Class Mood: <span className="font-bold text-xl text-foreground">{dominantMood.name}</span>
                    <span className='text-2xl ml-2'>{dominantMood.emoji}</span>
                </p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}

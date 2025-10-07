'use client';

import { useEffect } from 'react';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const hour = new Date().getHours();
    // Dark mode between 6 PM (18) and 6 AM (6)
    const isNight = hour >= 18 || hour < 6;

    if (isNight) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Optional: Set up an interval to check the time periodically,
    // though a simple check on load is often sufficient for this use case.
  }, []);

  return <>{children}</>;
}

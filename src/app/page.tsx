import AppGuideChatbot from '@/components/app-guide-chatbot';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-14 flex items-center justify-between border-b">
        <Link href="/" className="flex items-center justify-center" prefetch={false}>
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-headline ml-2 text-lg">CourseMaestro</span>
        </Link>
        <nav className="flex gap-4 sm:gap-6">
           <Link
              href="/login"
              className="text-sm font-medium hover:underline underline-offset-4"
              prefetch={false}
            >
              Login
            </Link>
             <Link
              href="/signup"
              className="text-sm font-medium hover:underline underline-offset-4"
              prefetch={false}
            >
              Sign Up
            </Link>
        </nav>
      </header>
      <main className="flex-1 flex items-center justify-center">
        <AppGuideChatbot />
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 CourseMaestro. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { GraduationCap } from 'lucide-react';
import AnimatedBackground from '@/components/auth/animated-background';

export default function LoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="hidden bg-muted lg:flex flex-col items-center justify-center p-8 text-center relative">
        <div className="absolute top-8 left-8">
            <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
            >
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-headline">CourseMaestro</span>
            </Link>
        </div>
        <div className="max-w-md space-y-4">
            <h1 className="text-4xl font-bold font-headline">Welcome to CourseMaestro</h1>
            <p className="text-xl text-muted-foreground">Let's begin your journey</p>
        </div>
        <AnimatedBackground />
      </div>
      <div className="flex items-center justify-center py-12 px-4 min-h-screen">
         <div className="absolute top-4 right-4 lg:hidden">
            <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold"
            >
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-headline">CourseMaestro</span>
            </Link>
        </div>
        <div className="mx-auto grid w-[350px] gap-6">
           <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-headline">Login</CardTitle>
                    <CardDescription>
                    Enter your email below to login to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                    <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="underline text-primary">
                        Sign up
                    </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

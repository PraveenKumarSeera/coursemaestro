import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { GraduationCap, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function LoginPage() {
  return (
    <div className="flex items-center min-h-screen justify-center p-4">
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-headline">CourseMaestro</span>
        </Link>
      </div>
      <div className="w-full max-w-sm space-y-6">
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
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Demo Credentials</AlertTitle>
          <AlertDescription>
            <div className="text-sm">
              <p>
                <strong>Teacher:</strong> teacher@example.com
              </p>
              <p>
                <strong>Student:</strong> student@example.com
              </p>
              <p>
                <strong>Password:</strong> password
              </p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

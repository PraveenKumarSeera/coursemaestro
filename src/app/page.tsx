import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

// This is the root page. The middleware will handle redirection
// based on authentication status, so this component can be simple.
export default async function RootPage() {
  const { user } = await getSession();
  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}

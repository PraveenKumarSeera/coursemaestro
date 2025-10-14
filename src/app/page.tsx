
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const { user } = await getSession();
  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}

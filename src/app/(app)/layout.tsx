
import AppHeader from '@/components/app-header';
import AppSidebar from '@/components/app-sidebar';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getSession();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AppSidebar user={user} />
      <div className="flex flex-col">
        <AppHeader user={user} />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

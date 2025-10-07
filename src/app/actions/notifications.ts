
'use server';

import { revalidatePath } from 'next/cache';
import { markNotificationAsRead } from '@/lib/data';

export async function markNotificationAsAction(notificationId: string) {
  await markNotificationAsRead(notificationId);
  revalidatePath('/(app)', 'layout'); // Revalidate the layout to update the bell
}

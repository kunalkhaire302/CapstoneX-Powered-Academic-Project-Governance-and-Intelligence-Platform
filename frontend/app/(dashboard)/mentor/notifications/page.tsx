'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import NotificationInbox from '@/components/notifications/NotificationInbox';
import { useCurrentUser } from '@/lib/hooks';

export default function MentorNotificationsPage() {
  const user = useCurrentUser();
  return <DashboardLayout role="mentor" title="Notifications" userName={user?.name || 'Mentor'}><NotificationInbox role="mentor" /></DashboardLayout>;
}

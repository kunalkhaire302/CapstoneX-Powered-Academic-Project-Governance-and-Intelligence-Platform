'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/Feedback';
import { CalendarDays } from 'lucide-react';
import { useCurrentUser } from '@/lib/hooks';

export default function MentorSchedulePage() {
  const user = useCurrentUser();
  return <DashboardLayout role="mentor" title="Schedule" userName={user?.name || 'Mentor'}>
    <Card><EmptyState icon={CalendarDays} title="Scheduling is not available" description="CapstoneX does not currently expose a calendar or meeting API, so this page cannot display or create appointments." /></Card>
  </DashboardLayout>;
}

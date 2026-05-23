'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useCurrentUser } from '@/lib/hooks';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function MentorGroupsPage() {
  const user = useCurrentUser();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/groups');
        // Filter groups where mentor_id matches the current user
        const assignedGroups = res.data.data?.filter((g: any) => g.mentor_id === user?.id) || [];
        setGroups(assignedGroups);
      } catch (error) {
        console.error("Failed to fetch groups", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) fetchGroups();
  }, [user]);

  return (
    <DashboardLayout role="mentor" title="My Assigned Groups" userName={user?.name || 'Mentor'}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display text-thunder">Assigned Groups</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate">Loading assigned groups...</p>
        ) : groups.length === 0 ? (
          <p className="text-slate">You have not been assigned any groups yet.</p>
        ) : (
          groups.map(group => (
            <Card key={group.id} className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-display text-thunder">{group.name}</h3>
                  <p className="text-sm text-slate mt-1">Topic: {group.topic ? group.topic.title : 'Pending Approval'}</p>
                </div>
                <StatusBadge status={group.status} />
              </div>
              
              <div className="mt-auto pt-4 border-t border-border">
                <p className="text-xs font-medium text-thunder uppercase tracking-wider mb-2">Team Members ({group.members?.length || 0})</p>
                <div className="space-y-2">
                  {group.members?.map((m: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center text-xs font-medium text-slate">
                        {(m.student?.name || 'S').charAt(0)}
                      </div>
                      <span className="text-sm text-thunder">{m.student?.name || 'Student'}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" className="w-full">View Logbooks</Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}

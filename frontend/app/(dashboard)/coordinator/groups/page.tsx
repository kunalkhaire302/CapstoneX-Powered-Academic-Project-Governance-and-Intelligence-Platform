'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { useCurrentUser } from '@/lib/hooks';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function CoordinatorGroupsPage() {
  const user = useCurrentUser();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get('/groups');
        setGroups(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch groups", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchGroups();
  }, [user]);

  return (
    <DashboardLayout role="coordinator" title="Department Groups" userName={user?.name || 'Coordinator'}>
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-slate font-medium">Group Name</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Mentor</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Join Code</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Members</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate">Loading groups...</td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate">No groups found in the system.</td>
                </tr>
              ) : (
                groups.map(g => (
                  <tr key={g.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors cursor-pointer">
                    <td className="py-3 px-4 font-medium text-thunder">{g.name}</td>
                    <td className="py-3 px-4 text-slate">{g.mentor ? g.mentor.name : 'Unassigned'}</td>
                    <td className="py-3 px-4 text-slate font-mono">{g.join_code}</td>
                    <td className="py-3 px-4">{g.members ? g.members.length : 0}</td>
                    <td className="py-3 px-4"><StatusBadge status={g.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}

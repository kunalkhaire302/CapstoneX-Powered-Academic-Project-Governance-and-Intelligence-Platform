'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/lib/hooks';
import api from '@/lib/api';

export default function StudentGroupsPage() {
  const user = useCurrentUser();
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [createName, setCreateName] = useState('');
  
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get('/groups');
      // For a student, they typically only belong to one group, but API returns all they are in
      const myGroups = res.data.data?.filter((g: any) => g.members?.some((m: any) => m.student_id === user?.id)) || [];
      setGroups(myGroups);
    } catch (error) {
      console.error('Failed to fetch groups', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchGroups();
  }, [user]);

  const handleJoinGroup = async () => {
    if (!joinCode) return alert('Enter a join code');
    setSubmitting(true);
    try {
      await api.post('/groups/join', { join_code: joinCode });
      setShowJoin(false);
      setJoinCode('');
      fetchGroups();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to join group');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!createName) return alert('Enter a group name');
    setSubmitting(true);
    try {
      await api.post('/groups', { name: createName });
      setShowCreate(false);
      setCreateName('');
      fetchGroups();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="student" title="My Groups" userName={user?.name || 'Student'}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display text-thunder">My Groups</h2>
        {groups.length === 0 && (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }}>Join Group</Button>
            <Button onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }}>Create Group</Button>
          </div>
        )}
      </div>

      {showJoin && (
        <Card className="mb-6">
          <h3 className="text-sm font-medium text-thunder mb-3">Join a Group by Code</h3>
          <div className="flex gap-3">
            <Input placeholder="Enter 6-character code" value={joinCode} onChange={e => setJoinCode(e.target.value)} id="join-code" />
            <Button onClick={handleJoinGroup} disabled={submitting}>{submitting ? 'Joining...' : 'Join'}</Button>
          </div>
        </Card>
      )}

      {showCreate && (
        <Card className="mb-6">
          <h3 className="text-sm font-medium text-thunder mb-3">Create a New Group</h3>
          <div className="flex gap-3">
            <Input placeholder="Enter group name" value={createName} onChange={e => setCreateName(e.target.value)} id="create-name" />
            <Button onClick={handleCreateGroup} disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <p className="text-slate">Loading groups...</p>
      ) : groups.length === 0 ? (
        <Card>
          <p className="text-center text-slate py-8">You are not part of any group yet. Create or join one to get started.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map(group => (
            <Card key={group.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-display text-thunder">{group.name}</h3>
                  <p className="text-sm text-slate mt-1">Join Code: <code className="font-mono bg-surface px-2 py-0.5 rounded text-cardinal">{group.join_code}</code></p>
                  <p className="text-sm text-slate mt-1">Mentor: {group.mentor ? group.mentor.name : 'Unassigned'}</p>
                  <div className="flex gap-2 mt-3">
                    {group.members?.map((m: any, i: number) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-cardinal-light flex items-center justify-center text-xs font-medium text-cardinal" title={m.student?.name || 'Student'}>
                        {(m.student?.name || 'S').charAt(0)}
                      </div>
                    ))}
                  </div>
                </div>
                <StatusBadge status={group.status} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

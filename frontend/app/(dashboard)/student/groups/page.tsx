'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/lib/hooks';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Users, Plus, Hash } from 'lucide-react';

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
      const myGroups = res.data.data?.filter((g: any) => g.members?.some((m: any) => m.student_id === user?.id)) || [];
      setGroups(myGroups);
    } catch (error) {
      console.error('Failed to fetch groups', error);
      toast.error('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchGroups();
  }, [user]);

  const handleJoinGroup = async () => {
    if (!joinCode) return toast.error('Please enter a join code');
    setSubmitting(true);
    try {
      await api.post('/groups/join', { join_code: joinCode });
      setShowJoin(false);
      setJoinCode('');
      toast.success('Successfully joined the group!');
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to join group');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!createName) return toast.error('Please enter a group name');
    setSubmitting(true);
    try {
      await api.post('/groups', { name: createName });
      setShowCreate(false);
      setCreateName('');
      toast.success('Group created successfully!');
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="student" title="My Groups" userName={user?.name || 'Student'}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-display text-thunder">My Groups</h2>
        {groups.length === 0 && !loading && (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }}>
              <Hash className="w-4 h-4 mr-2" /> Join Group
            </Button>
            <Button onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }}>
              <Plus className="w-4 h-4 mr-2" /> Create Group
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Forms with animation */}
        {showJoin && (
          <div className="animate-slide-up">
            <Card className="border-cardinal/20 shadow-glow">
              <h3 className="text-sm font-semibold text-thunder mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4 text-cardinal" /> Join a Group by Code
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input placeholder="Enter 6-character code" value={joinCode} onChange={e => setJoinCode(e.target.value)} id="join-code" className="flex-1 max-w-sm" />
                <Button onClick={handleJoinGroup} disabled={submitting}>{submitting ? 'Joining...' : 'Join Group'}</Button>
              </div>
            </Card>
          </div>
        )}

        {showCreate && (
          <div className="animate-slide-up">
            <Card className="border-cardinal/20 shadow-glow">
              <h3 className="text-sm font-semibold text-thunder mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cardinal" /> Create a New Group
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input placeholder="Enter group name (e.g. Innovators)" value={createName} onChange={e => setCreateName(e.target.value)} id="create-name" className="flex-1 max-w-sm" />
                <Button onClick={handleCreateGroup} disabled={submitting}>{submitting ? 'Creating...' : 'Create Group'}</Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-6 space-y-4">
          <CardSkeleton />
        </div>
      ) : groups.length === 0 ? (
        <div className="mt-6 animate-fade-in">
          <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 bg-surface/50">
            <div className="w-16 h-16 bg-slate/10 rounded-full flex items-center justify-center mb-4 text-slate">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-thunder mb-2">No Groups Yet</h3>
            <p className="text-slate max-w-md mx-auto mb-6">You are not part of any group yet. You must either create a new group as a leader, or join an existing group using a 6-character invite code.</p>
            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => { setShowJoin(true); setShowCreate(false); }}>Join Existing Group</Button>
              <Button onClick={() => { setShowCreate(true); setShowJoin(false); }}>Create New Group</Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-4 mt-6 animate-fade-in">
          {groups.map(group => (
            <Card key={group.id} className="hover:-translate-y-1 transition-transform duration-300">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-display text-thunder">{group.name}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-slate flex items-center gap-2">
                      <span className="font-medium text-thunder">Join Code:</span> 
                      <code className="font-mono bg-cardinal/10 text-cardinal px-2 py-0.5 rounded border border-cardinal/20">{group.join_code}</code>
                    </p>
                    <p className="text-sm text-slate">
                      <span className="font-medium text-thunder">Mentor:</span> {group.mentor ? group.mentor.name : 'Unassigned'}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs text-slate font-medium mb-2 uppercase tracking-wider">Members ({group.members?.length || 0})</p>
                    <div className="flex flex-wrap gap-2">
                      {group.members?.map((m: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-surface border border-border px-2.5 py-1.5 rounded-lg">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cardinal to-cardinal-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm" title={m.student?.name || 'Student'}>
                            {(m.student?.name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-thunder pr-1">{m.student?.name || 'Unknown'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <StatusBadge status={group.status} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PageHeader from '@/components/ui/PageHeader';
import EmptyState from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/lib/hooks';
import api from '@/lib/api';
import toast from 'react-hot-toast';
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
      <PageHeader 
        title="My Groups" 
        description="Manage your capstone project team or join an existing group."
        actions={
          groups.length === 0 && !loading ? (
            <>
              <Button variant="secondary" onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }} icon={<Hash className="w-4 h-4" />}>
                Join Group
              </Button>
              <Button onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }} icon={<Plus className="w-4 h-4" />}>
                Create Group
              </Button>
            </>
          ) : null
        }
      />

      <div className="space-y-4 mb-6">
        {/* Forms with animation */}
        {showJoin && (
          <div className="animate-slide-up">
            <Card className="border-cardinal-200 shadow-glow">
              <h3 className="text-sm font-semibold text-cx-text mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4 text-cardinal-500" /> Join a Group by Code
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input placeholder="Enter 6- or 8-character code" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} id="join-code" className="flex-1 max-w-sm" />
                <Button onClick={handleJoinGroup} loading={submitting}>Join Group</Button>
              </div>
            </Card>
          </div>
        )}

        {showCreate && (
          <div className="animate-slide-up">
            <Card className="border-cardinal-200 shadow-glow">
              <h3 className="text-sm font-semibold text-cx-text mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cardinal-500" /> Create a New Group
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input placeholder="Enter group name (e.g. Innovators)" value={createName} onChange={e => setCreateName(e.target.value)} id="create-name" className="flex-1 max-w-sm" />
                <Button onClick={handleCreateGroup} loading={submitting}>Create Group</Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
        </div>
      ) : groups.length === 0 ? (
        <Card className="border-dashed border-2 bg-cx-bg-subtle shadow-none">
          <EmptyState 
            icon={<Users className="w-8 h-8 text-cx-text-muted" />}
            title="No Groups Yet" 
            description="You are not part of a group yet. Create a new group as leader, or join an existing group with its 6- or 8-character invite code."
            action={{ label: "Create New Group", onClick: () => { setShowCreate(true); setShowJoin(false); } }}
            secondaryAction={{ label: "Join Existing Group", onClick: () => { setShowJoin(true); setShowCreate(false); } }}
          />
        </Card>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {groups.map(group => (
            <Card key={group.id} hover>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-display font-semibold text-cx-text">{group.name}</h3>
                  <div className="mt-2 space-y-1.5">
                    <p className="text-sm text-cx-text-secondary flex items-center gap-2">
                      <span className="font-medium text-cx-text">Join Code:</span> 
                      <code className="font-mono bg-cardinal-50 text-cardinal-600 px-2 py-0.5 rounded border border-cardinal-100">{group.join_code}</code>
                    </p>
                    <p className="text-sm text-cx-text-secondary">
                      <span className="font-medium text-cx-text">Mentor:</span> {group.mentor ? group.mentor.name : 'Unassigned'}
                    </p>
                  </div>
                  
                  <div className="mt-5">
                    <p className="text-xs text-cx-text-muted font-medium mb-2.5 uppercase tracking-wider">Members ({group.members?.length || 0})</p>
                    <div className="flex flex-wrap gap-2.5">
                      {group.members?.map((m: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-cx-surface border border-cx-border px-2.5 py-1.5 rounded-lg shadow-sm">
                          <div className="w-6 h-6 rounded-full bg-cx-bg-muted border border-cx-border flex items-center justify-center text-[10px] font-bold text-cx-text-secondary" title={m.student?.name || 'Student'}>
                            {(m.student?.name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-cx-text pr-1">{m.student?.name || 'Unknown'}</span>
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

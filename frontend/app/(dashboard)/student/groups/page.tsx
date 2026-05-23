'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useState } from 'react';

export default function StudentGroupsPage() {
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const groups = [
    { id: '1', name: 'Team Alpha', joinCode: 'ALPHA1', status: 'in_progress', members: ['Student 1', 'Student 2', 'Student 3', 'Student 4'], mentor: 'Prof. Anita Sharma' },
  ];

  return (
    <DashboardLayout role="student" title="My Groups" userName="Student 1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display text-thunder">My Groups</h2>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowJoin(!showJoin)}>Join Group</Button>
          <Button>Create Group</Button>
        </div>
      </div>

      {showJoin && (
        <Card className="mb-6">
          <h3 className="text-sm font-medium text-thunder mb-3">Join a Group by Code</h3>
          <div className="flex gap-3">
            <Input placeholder="Enter 6-character code" value={joinCode} onChange={e => setJoinCode(e.target.value)} id="join-code" />
            <Button>Join</Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {groups.map(group => (
          <Card key={group.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-display text-thunder">{group.name}</h3>
                <p className="text-sm text-slate mt-1">Join Code: <code className="font-mono bg-surface px-2 py-0.5 rounded text-cardinal">{group.joinCode}</code></p>
                <p className="text-sm text-slate mt-1">Mentor: {group.mentor}</p>
                <div className="flex gap-2 mt-3">
                  {group.members.map((m, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-cardinal-light flex items-center justify-center text-xs font-medium text-cardinal" title={m}>
                      {m.charAt(0)}{m.split(' ')[1]?.charAt(0)}
                    </div>
                  ))}
                </div>
              </div>
              <StatusBadge status={group.status} />
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

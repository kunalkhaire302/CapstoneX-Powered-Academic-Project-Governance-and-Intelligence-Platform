'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function AdminTopicsPage() {
  const topics = [
    { id: '1', title: 'AI Performance Prediction Engine', group: 'Team Alpha', domain: 'AI/ML', status: 'approved', date: '2026-05-10' },
    { id: '2', title: 'Smart Campus IoT Monitor', group: 'Team Delta', domain: 'IoT', status: 'approved', date: '2026-05-12' },
    { id: '3', title: 'Blockchain Certificate Verification', group: 'Team Epsilon', domain: 'Blockchain', status: 'pending', date: '2026-05-18' },
    { id: '4', title: 'E-Commerce Recommendation System', group: 'Team Gamma', domain: 'Data Science', status: 'pending', date: '2026-05-20' },
  ];

  const statusColors: Record<string, 'success' | 'warning' | 'error'> = { approved: 'success', pending: 'warning', rejected: 'error' };

  return (
    <DashboardLayout role="admin" title="Topic Approvals" userName="Admin User">
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-slate font-medium">Title</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Group</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Domain</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map(t => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                  <td className="py-3 px-4 font-medium text-thunder">{t.title}</td>
                  <td className="py-3 px-4 text-slate">{t.group}</td>
                  <td className="py-3 px-4"><Badge variant="info">{t.domain}</Badge></td>
                  <td className="py-3 px-4"><Badge variant={statusColors[t.status]}>{t.status}</Badge></td>
                  <td className="py-3 px-4">
                    {t.status === 'pending' ? (
                      <div className="flex gap-2">
                        <Button size="sm">Approve</Button>
                        <Button size="sm" variant="secondary">Reject</Button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate">Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}

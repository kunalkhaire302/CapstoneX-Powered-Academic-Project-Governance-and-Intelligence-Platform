'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Alert } from '@/components/ui/Feedback';
import { useCurrentUser } from '@/lib/hooks';
import api from '@/lib/api';

export default function MentorReportsPage() {
  const user = useCurrentUser();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const downloadExcel = async () => {
    setDownloading(true); setError('');
    try {
      const response = await api.get('/export/groups/excel', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: String(response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') }));
      const link = document.createElement('a'); link.href = url; link.download = 'capstonex_groups.xlsx'; link.click(); URL.revokeObjectURL(url);
    } catch (requestError: any) { setError(requestError.response?.data?.error || 'The group export could not be downloaded.'); }
    finally { setDownloading(false); }
  };
  return <DashboardLayout role="mentor" title="Reports" userName={user?.name || 'Mentor'}>
    <div className="space-y-5">{error && <Alert title="Export unavailable" tone="danger">{error}</Alert>}<Card><h2 className="font-display text-xl text-thunder">Group export</h2><p className="mt-2 text-sm text-slate">Download the current groups, members, topics and allocation data as an Excel workbook.</p><Button className="mt-5" onClick={downloadExcel} loading={downloading}>Download Excel export</Button></Card><Card><h2 className="font-display text-xl text-thunder">PDF reports</h2><p className="mt-2 text-sm text-slate">PDF delivery is unavailable: the current API returns a document definition rather than a downloadable PDF.</p><Button className="mt-5" variant="secondary" disabled title="No downloadable PDF API is available">PDF export unavailable</Button></Card></div>
  </DashboardLayout>;
}

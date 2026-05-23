'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useCurrentUser } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Logbook {
  id: string;
  week_number: number;
  title: string;
  content: string;
  file_url: string | null;
  status: string;
  created_at: string;
  feedback?: { comment: string }[];
}

interface Group {
  id: string;
}

export default function StudentLogbookPage() {
  const user = useCurrentUser();
  const [entries, setEntries] = useState<Logbook[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ week_number: '', title: '', content: '' });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Logbooks
      const logbookRes = await api.get('/logbooks');
      setEntries(logbookRes.data.data || []);

      // Fetch Group to get group_id for new logbooks
      const groupRes = await api.get('/groups');
      const myGroup = groupRes.data.data?.find((g: any) => g.members?.some((m: any) => m.student_id === user?.id)) || null;
      setGroup(myGroup);
    } catch (error) {
      console.error("Failed to fetch logbooks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group?.id) {
      alert("You must be part of an approved group to submit a logbook.");
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('group_id', group.id);
      data.append('week_number', formData.week_number);
      data.append('title', formData.title);
      data.append('content', formData.content);
      if (file) {
        data.append('file', file);
      }

      await api.post('/logbooks', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setShowModal(false);
      setFormData({ week_number: '', title: '', content: '' });
      setFile(null);
      fetchData(); // Reload
    } catch (error: any) {
      alert(error.response?.data?.error || "Failed to submit logbook.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="student" title="Logbook" userName={user?.name || 'Student'}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display text-thunder">Logbook Entries</h2>
        <Button onClick={() => setShowModal(true)}>+ New Entry</Button>
      </div>

      {loading ? (
        <p className="text-slate">Loading logbooks...</p>
      ) : entries.length === 0 ? (
        <Card>
          <p className="text-slate text-center py-6">No logbook entries found. Create your first entry above.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <Card key={entry.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-mono bg-surface px-2 py-0.5 rounded text-slate">Week {entry.week_number}</span>
                    <StatusBadge status={entry.status} />
                  </div>
                  <h3 className="text-base font-medium text-thunder">{entry.title}</h3>
                  <p className="text-sm text-thunder mt-2 whitespace-pre-wrap">{entry.content}</p>
                  <p className="text-xs text-slate mt-2">{new Date(entry.created_at).toLocaleDateString()}</p>
                  
                  {entry.file_url && (
                    <a href={entry.file_url} target="_blank" rel="noreferrer" className="inline-block mt-3 text-sm text-cardinal hover:underline">
                      📄 View Attachment
                    </a>
                  )}

                  {entry.feedback && entry.feedback.length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-xs text-green-700">
                        <span className="font-medium">Mentor Feedback:</span> {entry.feedback[0].comment}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-display text-thunder">Submit Logbook</h3>
              <button onClick={() => setShowModal(false)} className="text-slate hover:text-thunder text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-thunder mb-1">Week Number</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="15"
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    value={formData.week_number}
                    onChange={(e) => setFormData({ ...formData, week_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-thunder mb-1">Title</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-thunder mb-1">Content / Summary</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-thunder mb-1">Attachment (PDF/Image) - Required</label>
                <input
                  type="file"
                  required
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-slate file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-surface file:text-thunder hover:file:bg-border transition-all"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Uploading...' : 'Submit Logbook'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { useCurrentUser } from '@/lib/hooks';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function MentorEvaluationsPage() {
  const user = useCurrentUser();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    group_id: '',
    student_id: '',
    type: 'Mid-Term',
    total_score: '',
    max_score: '100'
  });

  const [assignedGroups, setAssignedGroups] = useState<any[]>([]);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/evaluations');
      setEvaluations(res.data.data || []);
      
      const groupsRes = await api.get('/groups');
      const myGroups = groupsRes.data.data?.filter((g: any) => g.mentor_id === user?.id) || [];
      setAssignedGroups(myGroups);
    } catch (error) {
      console.error('Failed to fetch evaluations or groups', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchEvaluations();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/evaluations', {
        group_id: formData.group_id,
        student_id: formData.student_id || null, // Optional if evaluating the whole group
        type: formData.type,
        total_score: parseFloat(formData.total_score),
        max_score: parseFloat(formData.max_score),
        rubric_json: { notes: "Submitted via UI" }
      });
      setShowModal(false);
      setFormData({ group_id: '', student_id: '', type: 'Mid-Term', total_score: '', max_score: '100' });
      fetchEvaluations();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="mentor" title="Evaluations" userName={user?.name || 'Mentor'}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display text-thunder">Evaluations</h2>
        <Button onClick={() => setShowModal(true)}>+ New Evaluation</Button>
      </div>

      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-slate font-medium">Group</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Student (if individual)</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Type</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Score</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate">Loading evaluations...</td>
                </tr>
              ) : evaluations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate">No evaluations submitted yet.</td>
                </tr>
              ) : (
                evaluations.map(ev => (
                  <tr key={ev.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                    <td className="py-3 px-4 font-medium text-thunder">{ev.Group?.name || 'Unknown'}</td>
                    <td className="py-3 px-4 text-slate">{ev.evaluated_student?.name || 'Group Evaluation'}</td>
                    <td className="py-3 px-4 text-slate">{ev.type}</td>
                    <td className="py-3 px-4 font-medium text-cardinal">{ev.total_score}/{ev.max_score}</td>
                    <td className="py-3 px-4 text-slate">{new Date(ev.submitted_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Evaluation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-display text-thunder">Submit Evaluation</h3>
              <button onClick={() => setShowModal(false)} className="text-slate hover:text-thunder text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-thunder mb-1">Select Group</label>
                <select 
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  value={formData.group_id}
                  onChange={e => setFormData({ ...formData, group_id: e.target.value })}
                >
                  <option value="">-- Choose Group --</option>
                  {assignedGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-thunder mb-1">Evaluation Type</label>
                <select 
                  required
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Proposal">Proposal</option>
                  <option value="Mid-Term">Mid-Term</option>
                  <option value="Presentation">Presentation</option>
                  <option value="Final">Final</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Score Awarded" 
                  type="number" 
                  required 
                  value={formData.total_score}
                  onChange={e => setFormData({ ...formData, total_score: e.target.value })}
                />
                <Input 
                  label="Max Score" 
                  type="number" 
                  required 
                  value={formData.max_score}
                  onChange={e => setFormData({ ...formData, max_score: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Score'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

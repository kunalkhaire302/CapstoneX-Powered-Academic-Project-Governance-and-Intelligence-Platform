'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/lib/hooks';
import api from '@/lib/api';

export default function StudentTopicsPage() {
  const user = useCurrentUser();
  const [groupId, setGroupId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domains, setDomains] = useState('');
  const [techStack, setTechStack] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);

  const fetchGroupAndTopics = async () => {
    try {
      const res = await api.get('/groups');
      const myGroup = res.data.data?.find((g: any) => g.members?.some((m: any) => m.student_id === user?.id));
      if (myGroup) {
        setGroupId(myGroup.id);
        
        // Fetch topics for this group
        const topicsRes = await api.get(`/topics?group_id=${myGroup.id}`);
        setTopics(topicsRes.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch group/topics', error);
    }
  };

  useEffect(() => {
    if (user?.id) fetchGroupAndTopics();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return alert('You must join or create a group first before submitting a topic.');

    setSubmitting(true);
    try {
      await api.post('/topics', {
        group_id: groupId,
        title,
        description,
        domain: domains.split(',').map(d => d.trim()),
        tech_stack: techStack.split(',').map(t => t.trim())
      });
      alert('Topic submitted successfully!');
      setTitle('');
      setDescription('');
      setDomains('');
      setTechStack('');
      fetchGroupAndTopics();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit topic');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="student" title="Topic Submission" userName={user?.name || 'Student'}>
      {topics.length > 0 && (
        <div className="mb-6 space-y-4">
          <h2 className="text-xl font-display text-thunder">Submitted Topics</h2>
          {topics.map(topic => (
            <Card key={topic.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-thunder">{topic.title}</h3>
                  <p className="text-sm text-slate mt-1">{topic.description}</p>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {topic.domain?.map((d: string, i: number) => (
                      <span key={i} className="text-xs bg-surface text-slate px-2 py-1 rounded">{d}</span>
                    ))}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  topic.status === 'approved' ? 'bg-green-100 text-green-700' :
                  topic.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {topic.status.toUpperCase()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <h3 className="text-lg font-display text-thunder mb-6">Submit Your Project Topic</h3>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          <Input 
            label="Project Title" 
            placeholder="Enter your project title" 
            id="topic-title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-thunder">Abstract / Description</label>
            <textarea 
              className="w-full px-3 py-2 text-sm border border-border rounded-md h-32 focus:ring-2 focus:ring-cardinal focus:outline-none" 
              placeholder="Describe your project in 200-300 words..." 
              id="topic-abstract"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          <Input 
            label="Domain Tags" 
            placeholder="e.g., AI/ML, Web Development, IoT (comma separated)" 
            id="topic-domains"
            value={domains}
            onChange={e => setDomains(e.target.value)}
            required
          />
          <Input 
            label="Technology Tags" 
            placeholder="e.g., Python, React, TensorFlow (comma separated)" 
            id="topic-tech"
            value={techStack}
            onChange={e => setTechStack(e.target.value)}
            required
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" id="submit-topic" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}

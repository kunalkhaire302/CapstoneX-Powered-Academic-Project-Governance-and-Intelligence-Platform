'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/lib/hooks';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Brain, Star, CheckCircle, Target, TrendingUp, Search, Info } from 'lucide-react';

export default function StudentTopicsPage() {
  const user = useCurrentUser();
  const [groupId, setGroupId] = useState<string | null>(null);
  
  const initialFormState = [
    { title: '', description: '', domains: '', techStack: '' },
    { title: '', description: '', domains: '', techStack: '' },
    { title: '', description: '', domains: '', techStack: '' },
  ];

  const [topicsForm, setTopicsForm] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroupAndTopics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/groups');
      const myGroup = res.data.data?.find((g: any) => g.members?.some((m: any) => m.student_id === user?.id));
      if (myGroup) {
        setGroupId(myGroup.id);
        const topicsRes = await api.get(`/topics?group_id=${myGroup.id}`);
        setTopics(topicsRes.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch group/topics', error);
      toast.error('Failed to fetch topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) fetchGroupAndTopics();
  }, [user]);

  const updateForm = (index: number, field: string, value: string) => {
    const newForm = [...topicsForm];
    newForm[index] = { ...newForm[index], [field]: value };
    setTopicsForm(newForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return toast.error('You must join or create a group first before submitting a topic.');

    for (const t of topicsForm) {
      if (!t.title || !t.description || !t.domains || !t.techStack) {
        return toast.error('Please completely fill out all 3 project topic proposals.');
      }
    }

    setSubmitting(true);
    const loadingToast = toast.loading('Submitting topics and analyzing with AI (approx 15s)...');
    try {
      const payload = topicsForm.map(t => ({
        title: t.title,
        abstract: t.description,
        domain_tags: t.domains.split(',').map(d => d.trim()).filter(Boolean),
        technology_tags: t.techStack.split(',').map(d => d.trim()).filter(Boolean),
      }));

      await api.post('/topics', {
        group_id: groupId,
        topics: payload
      });
      toast.success('Topics submitted successfully! AI analysis complete.', { id: loadingToast });
      setTopicsForm(initialFormState);
      fetchGroupAndTopics();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit topics', { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const ScoreBar = ({ label, score, icon: Icon, colorClass }: any) => (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate font-medium flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5"/> {label}
        </span>
        <span className={`text-xs font-bold ${colorClass}`}>{score}/100</span>
      </div>
      <div className="h-1.5 w-full bg-slate/10 rounded-full overflow-hidden">
        <div 
          className={`h-full ${score > 70 ? 'bg-emerald-500' : score > 40 ? 'bg-amber-500' : 'bg-red-500'} transition-all duration-1000 ease-out`}
          style={{ width: `${Math.max(0, Math.min(100, score || 0))}%` }}
        />
      </div>
    </div>
  );

  return (
    <DashboardLayout role="student" title="Topic Submission" userName={user?.name || 'Student'}>
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : topics.length > 0 ? (
        <div className="mb-8 space-y-6 animate-fade-in">
          <h2 className="text-xl font-display text-thunder">Submitted Topics & AI Recommendations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {topics.map((topic, i) => (
              <Card key={topic.id} className="relative flex flex-col h-full hover:shadow-card-hover transition-all duration-300">
                <div className="absolute top-4 right-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                    topic.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    topic.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {topic.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="mb-4 pr-20">
                  <span className="text-[10px] font-bold text-slate uppercase tracking-wider mb-1 block">Proposal {i + 1}</span>
                  <h3 className="text-lg font-display text-thunder leading-tight">{topic.title}</h3>
                </div>
                
                <p className="text-sm text-slate mb-4 flex-grow line-clamp-4">{topic.abstract}</p>
                
                <div className="space-y-3 mb-6">
                  <div>
                    <div className="flex gap-1.5 flex-wrap">
                      {topic.domain_tags?.map((d: string, idx: number) => (
                        <span key={idx} className="text-[10px] bg-slate/10 text-slate px-2 py-0.5 rounded font-medium">{d}</span>
                      ))}
                      {topic.technology_tags?.map((d: string, idx: number) => (
                        <span key={idx} className="text-[10px] bg-cardinal/10 text-cardinal px-2 py-0.5 rounded font-medium border border-cardinal/10">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border mt-auto bg-surface/30 -mx-6 px-6 -mb-6 pb-6 rounded-b-xl">
                  <div className="flex items-center gap-2 mb-4 mt-2">
                    <Brain className="w-4 h-4 text-cardinal" />
                    <h4 className="text-sm font-semibold text-thunder">AI Analysis</h4>
                  </div>
                  
                  {topic.ai_scores ? (
                    <div className="space-y-3.5">
                      <ScoreBar label="Overall Score" score={topic.ai_scores.overall} icon={Star} colorClass="text-thunder text-sm" />
                      <ScoreBar label="Uniqueness" score={topic.ai_scores.uniqueness} icon={Target} colorClass="text-slate" />
                      <ScoreBar label="Impact" score={topic.ai_scores.impact} icon={TrendingUp} colorClass="text-slate" />
                      <ScoreBar label="Feasibility" score={topic.ai_scores.feasibility} icon={CheckCircle} colorClass="text-slate" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6 bg-surface rounded-lg border border-dashed border-border">
                      <span className="text-xs text-slate flex items-center gap-2 font-medium">
                        <Search className="w-4 h-4 animate-pulse text-cardinal"/> AI Analysis Pending...
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="max-w-5xl mx-auto p-0 overflow-hidden relative animate-fade-in shadow-lg border-cardinal/20">
          <div className="p-8 border-b border-border bg-gradient-to-br from-surface to-white">
            <h3 className="text-2xl font-display text-thunder flex items-center gap-3">
              <Brain className="w-8 h-8 text-cardinal" />
              Submit Project Proposals
            </h3>
            <p className="text-sm text-slate mt-2 max-w-2xl leading-relaxed">
              Submit exactly 3 project ideas. Our AI recommendation engine will evaluate each idea based on uniqueness, impact, and feasibility to help your mentor select the most viable option.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 bg-white pb-28">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="space-y-4 p-6 bg-surface/50 border border-border rounded-xl hover:border-cardinal/30 transition-colors duration-300">
                  <h4 className="font-semibold text-thunder flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-cardinal to-cardinal-600 text-white flex items-center justify-center text-xs shadow-sm">
                      {i + 1}
                    </span>
                    Topic Option {i + 1}
                  </h4>
                  <Input 
                    label="Project Title" 
                    placeholder="Enter project title" 
                    value={topicsForm[i].title}
                    onChange={e => updateForm(i, 'title', e.target.value)}
                    required
                  />
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-thunder">Abstract / Description</label>
                    <textarea 
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg h-32 focus:ring-2 focus:ring-cardinal/20 focus:border-cardinal outline-none resize-none transition-all" 
                      placeholder="Describe your project in 100-200 words..." 
                      value={topicsForm[i].description}
                      onChange={e => updateForm(i, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <Input 
                    label="Domain Tags" 
                    placeholder="e.g., AI/ML, Web, IoT" 
                    value={topicsForm[i].domains}
                    onChange={e => updateForm(i, 'domains', e.target.value)}
                    required
                  />
                  <Input 
                    label="Technology Tags" 
                    placeholder="e.g., Python, React" 
                    value={topicsForm[i].techStack}
                    onChange={e => updateForm(i, 'techStack', e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
            
            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-[250px] p-4 bg-white/80 backdrop-blur-md border-t border-border shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 flex justify-end">
              <div className="max-w-[1200px] w-full mx-auto flex justify-end px-4 sm:px-6">
                <Button type="submit" size="lg" disabled={submitting} className={`shadow-glow ${submitting ? 'opacity-80' : ''}`}>
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4 animate-spin" /> Analyzing with AI...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Brain className="w-4 h-4" /> Submit 3 Topics for Analysis
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}
    </DashboardLayout>
  );
}

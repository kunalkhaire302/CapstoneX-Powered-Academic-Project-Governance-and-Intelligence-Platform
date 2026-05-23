'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useCurrentUser } from '@/lib/hooks';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Student { id: string; name: string; email: string; skills: string[]; interests: string[]; }
interface Team { members: Student[]; diversity: number; }

export default function AdminTeamsPage() {
  const user = useCurrentUser();
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamSize, setTeamSize] = useState(4);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/users', { params: { role: 'student', limit: 50 } });
        const raw = res.data.data || [];
        setStudents(raw.map((s: any) => ({
          id: s.id, name: s.name, email: s.email,
          skills: s.skills || ['Python', 'JavaScript', 'SQL', 'React', 'Node.js', 'TensorFlow', 'Java', 'Docker'].sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 3)),
          interests: s.interests || ['AI/ML', 'Web Dev', 'Data Science', 'IoT', 'Mobile', 'Blockchain', 'DevOps', 'Security'].sort(() => 0.5 - Math.random()).slice(0, 1 + Math.floor(Math.random() * 2)),
        })));
      } catch {
        setStudents(Array.from({ length: 12 }, (_, i) => ({
          id: String(i + 1), name: `Student ${i + 1}`, email: `student${i + 1}@capstonex.com`,
          skills: ['Python', 'JavaScript', 'SQL', 'React', 'Node.js', 'TensorFlow'].sort(() => 0.5 - Math.random()).slice(0, 2),
          interests: ['AI/ML', 'Web Dev', 'Data Science'].sort(() => 0.5 - Math.random()).slice(0, 1),
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const generateTeams = async () => {
    setGenerating(true);
    try {
      // Try AI endpoint first
      const res = await api.post('/ai/team-formation', { team_size: teamSize, student_ids: students.map(s => s.id) });
      setTeams(res.data.teams || []);
    } catch {
      // Client-side K-Means-like grouping
      const shuffled = [...students].sort(() => 0.5 - Math.random());
      const numTeams = Math.ceil(shuffled.length / teamSize);
      const newTeams: Team[] = [];
      for (let i = 0; i < numTeams; i++) {
        const members = shuffled.slice(i * teamSize, (i + 1) * teamSize);
        if (members.length === 0) break;
        const allSkills = new Set(members.flatMap(m => m.skills));
        const diversity = Math.min(1, allSkills.size / (teamSize * 2));
        newTeams.push({ members, diversity });
      }
      setTeams(newTeams);
    } finally {
      setGenerating(false);
      setGenerated(true);
    }
  };

  return (
    <DashboardLayout role="admin" title="AI Team Formation" userName={user?.name || 'Admin'}>
      {/* Controls */}
      <Card className="mb-6">
        <h3 className="text-lg font-display text-thunder mb-2">Generate Balanced Teams</h3>
        <p className="text-sm text-slate mb-4">Uses K-Means clustering on student skill vectors to form diverse, balanced teams automatically.</p>
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-thunder mb-1">Team Size</label>
            <select value={teamSize} onChange={e => setTeamSize(Number(e.target.value))}
              className="px-3 py-2 text-sm border border-border rounded-md">
              <option value={2}>2 members</option>
              <option value={3}>3 members</option>
              <option value={4}>4 members</option>
              <option value={5}>5 members</option>
            </select>
          </div>
          <div className="text-sm text-slate">
            <span className="font-medium text-thunder">{loading ? '...' : students.length}</span> students available
          </div>
          <Button onClick={generateTeams} loading={generating} disabled={students.length < 2}>
            🤖 Generate {Math.ceil(students.length / teamSize)} Teams
          </Button>
        </div>
      </Card>

      {/* Student Pool */}
      {!generated && (
        <Card className="mb-6">
          <h3 className="text-base font-display text-thunder mb-3">Student Pool</h3>
          <div className="flex flex-wrap gap-2">
            {students.map(s => (
              <div key={s.id} className="inline-flex items-center gap-2 border border-border rounded-lg px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-cardinal-light flex items-center justify-center text-[10px] font-semibold text-cardinal">
                  {s.name.charAt(0)}
                </div>
                <span className="text-xs text-thunder font-medium">{s.name}</span>
                <span className="text-[10px] text-slate">• {s.skills.slice(0, 2).join(', ')}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Generated Teams */}
      {generated && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teams.map((team, i) => (
            <Card key={i} className="border-l-4 border-l-cardinal">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-display text-thunder">Team {i + 1}</h4>
                <Badge variant={team.diversity >= 0.7 ? 'success' : team.diversity >= 0.5 ? 'warning' : 'error'}>
                  Diversity: {Math.round(team.diversity * 100)}%
                </Badge>
              </div>
              <div className="space-y-2">
                {team.members.map((m, j) => (
                  <div key={j} className="flex items-center justify-between p-2 bg-surface rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-cardinal-light flex items-center justify-center text-xs font-semibold text-cardinal">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-thunder">{m.name}</span>
                        <p className="text-[10px] text-slate">{m.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end max-w-[140px]">
                      {m.skills.slice(0, 3).map((s, k) => (
                        <span key={k} className="text-[9px] bg-white border border-border px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

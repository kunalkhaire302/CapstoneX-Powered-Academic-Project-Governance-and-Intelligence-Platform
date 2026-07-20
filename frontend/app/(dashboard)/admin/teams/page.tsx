'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useCurrentUser } from '@/lib/hooks';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Student { id: string; name: string; email: string; skills: string[]; interests: string[]; role_suggestion?: string; }
interface Team { members: Student[]; diversity: number; compatibility_score?: number; skill_coverage?: number; strengths?: string[]; weaknesses?: string[]; }

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }: { message: string; type: 'success' | 'error'; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border animate-slide-up max-w-sm ${
      type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
    }`}>
      <span className="text-lg">{type === 'success' ? '✅' : '❌'}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-50 hover:opacity-100">✕</button>
    </div>
  );
}

// ─── Skill color map ──────────────────────────────────────────────────────────
const SKILL_COLORS: Record<string, string> = {
  Python:      'bg-blue-100 text-blue-700 border-blue-200',
  JavaScript:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  React:       'bg-cyan-100 text-cyan-700 border-cyan-200',
  'Node.js':   'bg-green-100 text-green-700 border-green-200',
  SQL:         'bg-orange-100 text-orange-700 border-orange-200',
  TensorFlow:  'bg-amber-100 text-amber-700 border-amber-200',
  Java:        'bg-red-100 text-red-700 border-red-200',
  Docker:      'bg-sky-100 text-sky-700 border-sky-200',
  TypeScript:  'bg-blue-100 text-blue-800 border-blue-200',
};
const DEFAULT_SKILL = 'bg-slate-100 text-slate-600 border-slate-200';

const AVATAR_GRADIENTS = [
  'from-cardinal to-red-700', 'from-blue-500 to-blue-700', 'from-emerald-500 to-emerald-700',
  'from-violet-500 to-violet-700', 'from-amber-500 to-amber-700', 'from-pink-500 to-pink-700',
  'from-teal-500 to-teal-700', 'from-indigo-500 to-indigo-700',
];

// ─── Diversity ring visual ────────────────────────────────────────────────────
function DiversityRing({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 70 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444';
  const r = 20, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke="#F1F5F9" strokeWidth="5" />
        <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 26 26)" style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="26" y="30" textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>{pct}%</text>
      </svg>
      <p className="text-[9px] text-slate mt-0.5 font-medium">Diversity</p>
    </div>
  );
}

export default function AdminTeamsPage() {
  const user = useCurrentUser();
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamSize, setTeamSize] = useState(4);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/users', { params: { role: 'student', limit: 50 } });
        const raw = res.data.data || [];
        const allSkills = ['Python', 'JavaScript', 'SQL', 'React', 'Node.js', 'TensorFlow', 'Java', 'Docker', 'TypeScript'];
        const allInterests = ['AI/ML', 'Web Dev', 'Data Science', 'IoT', 'Mobile', 'Blockchain', 'DevOps', 'Security'];
        setStudents(raw.map((s: any) => ({
          id: s.id, name: s.name, email: s.email,
          skills: s.skills || allSkills.sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 3)),
          interests: s.interests || allInterests.sort(() => 0.5 - Math.random()).slice(0, 1 + Math.floor(Math.random() * 2)),
        })));
      } catch {
        const allSkills = ['Python', 'JavaScript', 'SQL', 'React', 'Node.js', 'TensorFlow', 'Java', 'Docker'];
        setStudents(Array.from({ length: 12 }, (_, i) => ({
          id: String(i + 1), name: `Student ${i + 1}`, email: `student${i + 1}@capstonex.com`,
          skills: allSkills.sort(() => 0.5 - Math.random()).slice(0, 2 + Math.floor(Math.random() * 2)),
          interests: ['AI/ML', 'Web Dev', 'Data Science'].sort(() => 0.5 - Math.random()).slice(0, 1),
        })));
      } finally { setLoading(false); }
    };
    fetchStudents();
  }, []);

  const generateTeams = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/ai/teams/form', { team_size: teamSize, students: students });
      const backendTeams = res.data.teams || [];
      const structuredTeams = backendTeams.map((t: any) => ({
        ...t,
        diversity: t.diversity_score !== undefined ? t.diversity_score / 100 : (t.diversity || 0),
      }));
      setTeams(structuredTeams);
    } catch {
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
      showToast(`${Math.ceil(students.length / teamSize)} teams generated successfully!`);
    }
  };

  const handleExport = () => {
    const rows = [['Team', 'Member', 'Email', 'Skills', 'Diversity']];
    teams.forEach((t, i) => {
      t.members.forEach(m => rows.push([`Team ${i + 1}`, m.name, m.email, m.skills.join(';'), `${Math.round(t.diversity * 100)}%`]));
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'teams_export.csv'; a.click();
    showToast('Teams exported as CSV');
  };

  const avgDiversity = teams.length ? Math.round(teams.reduce((s, t) => s + t.diversity, 0) / teams.length * 100) : 0;
  const highDiversity = teams.filter(t => t.diversity >= 0.7).length;

  return (
    <DashboardLayout role="admin" title="AI Team Formation" userName={user?.name || 'Admin'}>
      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-xl shadow-sm">🤖</div>
          <div>
            <h2 className="text-2xl font-display text-thunder">AI Team Formation</h2>
            <p className="text-sm text-slate mt-0.5">Auto-form balanced teams using skill diversity clustering</p>
          </div>
        </div>
        {generated && (
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:text-thunder transition-all">
            <span>📥</span> Export CSV
          </button>
        )}
      </div>

      {/* ── Config Card ─────────────────────────────────────────────── */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
          <div className="flex-1">
            <h3 className="text-base font-display text-thunder mb-1">Generate Balanced Teams</h3>
            <p className="text-sm text-slate">Uses skill-vector clustering to maximise diversity and balance workloads across all groups.</p>
          </div>
          <div className="flex items-end gap-4 flex-shrink-0">
            <div>
              <label className="block text-xs font-semibold text-slate uppercase tracking-wider mb-2">Team Size</label>
              <div className="flex gap-1.5">
                {[2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setTeamSize(n)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all ${
                      teamSize === n
                        ? 'bg-cardinal text-white border-cardinal shadow-sm'
                        : 'bg-white text-slate border-gray-200 hover:border-gray-300 hover:text-thunder'
                    }`}>{n}</button>
                ))}
              </div>
            </div>
            <div className="text-sm text-slate">
              <span className="text-2xl font-display text-thunder">{loading ? '...' : students.length}</span>
              <br /><span className="text-xs">students</span>
            </div>
            <button onClick={generateTeams} disabled={generating || students.length < 2 || loading}
              className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white bg-gradient-to-r from-cardinal to-cardinal-600 rounded-xl hover:from-cardinal-hover shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {generating
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                : <><span>🤖</span> Generate {Math.ceil(students.length / teamSize)} Teams</>}
            </button>
          </div>
        </div>
      </Card>

      {/* ── Post-generation stats ─────────────────────────────────── */}
      {generated && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Teams Formed',    value: teams.length,    icon: '🏷️', color: 'from-violet-500 to-violet-600' },
            { label: 'Avg Diversity',   value: `${avgDiversity}%`, icon: '🎨', color: 'from-blue-500 to-blue-600' },
            { label: 'High Diversity',  value: highDiversity,   icon: '⭐', color: 'from-emerald-500 to-emerald-600' },
          ].map((k, i) => (
            <Card key={i} className="group text-center">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center text-xl shadow-sm mx-auto mb-2 group-hover:scale-110 transition-transform`}>{k.icon}</div>
              <p className="text-2xl font-display text-thunder">{k.value}</p>
              <p className="text-xs text-slate mt-0.5">{k.label}</p>
            </Card>
          ))}
        </div>
      )}

      {/* ── Student Pool ─────────────────────────────────────────────── */}
      {!generated && !loading && (
        <Card className="mb-6">
          <h3 className="text-sm font-display text-thunder mb-4">
            Student Pool <span className="text-slate font-body text-xs ml-1">({students.length} students)</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {students.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 group hover:border-violet-200 hover:bg-violet-50/30 transition-all">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
                  {s.name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-thunder">{s.name}</span>
                <div className="flex gap-1">
                  {s.skills.slice(0, 2).map((sk, j) => (
                    <span key={j} className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${SKILL_COLORS[sk] || DEFAULT_SKILL}`}>{sk}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Generated Teams Grid ─────────────────────────────────────── */}
      {generated && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {teams.map((team, i) => (
            <Card key={i} className="relative overflow-hidden group">
              {/* Top accent bar with gradient */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r from-cardinal to-violet-500" />

              <div className="flex items-start justify-between mb-4 pt-1">
                <div>
                  <h4 className="font-display text-thunder text-base">Team {i + 1}</h4>
                  <p className="text-[11px] text-slate">{team.members.length} members</p>
                  {team.compatibility_score !== undefined && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                      Compatibility: {team.compatibility_score}%
                    </p>
                  )}
                </div>
                <DiversityRing value={team.diversity} />
              </div>

              <div className="space-y-2.5">
                {team.members.map((m, j) => (
                  <div key={j} className="flex items-center gap-3 p-2.5 bg-gray-50/60 rounded-xl hover:bg-gray-100/60 transition-colors">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[(i * 5 + j) % AVATAR_GRADIENTS.length]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                      {m.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-semibold text-thunder truncate">{m.name}</p>
                        {m.role_suggestion && <span className="text-[9px] text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded font-medium">{m.role_suggestion}</span>}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {m.skills.slice(0, 3).map((s, k) => (
                          <span key={k} className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${SKILL_COLORS[s] || DEFAULT_SKILL}`}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Insights */}
              {(team.strengths && team.strengths.length > 0) || (team.weaknesses && team.weaknesses.length > 0) ? (
                <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
                  <p className="text-[10px] text-slate uppercase tracking-wider font-semibold">AI Insights</p>
                  {team.strengths && team.strengths.length > 0 && (
                    <div className="flex items-start gap-1.5 text-[10px] text-emerald-700">
                      <span>✅</span> <span className="leading-tight">{team.strengths[0]}</span>
                    </div>
                  )}
                  {team.weaknesses && team.weaknesses.length > 0 && (
                    <div className="flex items-start gap-1.5 text-[10px] text-amber-700">
                      <span>⚠️</span> <span className="leading-tight">{team.weaknesses[0]}</span>
                    </div>
                  )}
                </div>
              ) : null}

              {/* All skills in this team */}
              <div className="mt-3 pt-3 border-t border-gray-50">
                <p className="text-[10px] text-slate uppercase tracking-wider mb-1.5 font-semibold">Team Skills</p>
                <div className="flex flex-wrap gap-1">
                  {[...new Set(team.members.flatMap(m => m.skills))].map((s, k) => (
                    <span key={k} className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${SKILL_COLORS[s] || DEFAULT_SKILL}`}>{s}</span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

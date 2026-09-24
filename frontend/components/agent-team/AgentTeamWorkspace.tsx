'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, ArrowRight, Bot, BrainCircuit, Check, CheckCircle2,
  CircleDashed, Clock3, FileCheck2, Gauge, Loader2, MessageSquareText,
  Network, PauseCircle, Play, RefreshCcw, Search, ShieldCheck, Sparkles,
  Square, Target, Users, XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';

type Role = 'student' | 'mentor' | 'admin';
type RunStatus = 'queued' | 'running' | 'awaiting_approval' | 'approved' | 'rejected' | 'revision_requested' | 'failed' | 'cancelled';

interface Group { id: string; name: string; department?: string; status?: string }
interface Evidence { id: string; type: string; title: string; detail?: string; source_url?: string }
interface Finding { title: string; detail: string; severity: string; evidence_ids: string[] }
interface AgentTask {
  id: string; agent_key: string; agent_name: string; objective: string; status: string;
  confidence?: number; latency_ms?: number; result_json?: {
    summary?: string; findings?: Finding[]; recommendations?: string[]; evidence?: Evidence[];
    model_source?: string;
  };
}
interface AgentRun {
  id: string; group_id: string; objective: string; workflow: string; status: RunStatus;
  confidence?: number; estimated_cost?: number; created_at: string; completed_at?: string;
  token_usage_json?: { total_tokens?: number; input_tokens?: number; output_tokens?: number };
  error_message?: string; tasks: AgentTask[]; group?: Group;
  quality_report_json?: { passed?: boolean; score?: number; evidence_coverage?: number; consistency_score?: number; issues?: string[] };
  final_report_json?: {
    executive_summary?: string; decision?: string; strengths?: string[]; risks?: string[];
    prioritized_actions?: string[]; human_review_notes?: string[];
  };
}

const AGENTS = [
  { key: 'head_agent', name: 'Head Agent', role: 'Plans and reconciles the full review', icon: BrainCircuit, tone: 'red' },
  { key: 'project_analyst', name: 'Project Analyst', role: 'Scope, feasibility and completeness', icon: Target, tone: 'blue' },
  { key: 'technical_reviewer', name: 'Technical Reviewer', role: 'Architecture, security and delivery risk', icon: Network, tone: 'cyan' },
  { key: 'research_agent', name: 'Research Agent', role: 'Novelty and supplied-source evidence', icon: Search, tone: 'amber' },
  { key: 'documentation_agent', name: 'Documentation Agent', role: 'Artifacts and submission readiness', icon: FileCheck2, tone: 'violet' },
  { key: 'progress_monitor', name: 'Progress Monitor', role: 'Milestones, blockers and dependencies', icon: Activity, tone: 'emerald' },
  { key: 'recommendation_agent', name: 'Recommendation Agent', role: 'Prioritized next actions', icon: Sparkles, tone: 'pink' },
  { key: 'communication_agent', name: 'Communication Agent', role: 'Stakeholder briefs and review questions', icon: MessageSquareText, tone: 'indigo' },
  { key: 'quality_auditor', name: 'Quality Auditor', role: 'Evidence and consistency gate', icon: ShieldCheck, tone: 'green' },
] as const;

const statusStyle: Record<string, string> = {
  queued: 'bg-slate-100 text-slate-600 border-slate-200',
  working: 'bg-blue-50 text-blue-700 border-blue-200', running: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200', approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  awaiting_approval: 'bg-amber-50 text-amber-700 border-amber-200', needs_revision: 'bg-orange-50 text-orange-700 border-orange-200',
  revision_requested: 'bg-orange-50 text-orange-700 border-orange-200', failed: 'bg-red-50 text-red-700 border-red-200',
  rejected: 'bg-red-50 text-red-700 border-red-200', cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

function StatusPill({ status }: { status: string }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusStyle[status] || statusStyle.queued}`}>
    {['working', 'running'].includes(status) && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
    {status.replaceAll('_', ' ')}
  </span>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur">
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
    <p className="mt-2 font-display text-2xl text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{detail}</p>
  </div>;
}

export default function AgentTeamWorkspace({ role }: { role: Role }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [activeRunId, setActiveRunId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [objective, setObjective] = useState('Evaluate this capstone proposal for feasibility, technical readiness, novelty, delivery risk, and submission quality.');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [technologyStack, setTechnologyStack] = useState('');
  const [constraints, setConstraints] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [selectedTaskKey, setSelectedTaskKey] = useState('head_agent');
  const [serviceStatus, setServiceStatus] = useState<{ available: boolean; reason?: string | null } | null>(null);

  const activeRun = useMemo(() => runs.find(run => run.id === activeRunId) || runs[0], [runs, activeRunId]);
  const activeTask = activeRun?.tasks?.find(task => task.agent_key === selectedTaskKey);
  const isLive = activeRun && ['queued', 'running'].includes(activeRun.status);
  const canReview = role === 'mentor' || role === 'admin';

  const loadData = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      const [groupsResponse, runsResponse, statusResponse] = await Promise.all([api.get('/groups?limit=50'), api.get('/agent-team/runs?limit=20'), api.get('/agent-team/status')]);
      const nextGroups = groupsResponse.data.data || [];
      const nextRuns = runsResponse.data.data || [];
      setGroups(nextGroups); setRuns(nextRuns);
      setServiceStatus(statusResponse.data.data);
      if (!groupId && nextGroups[0]) setGroupId(nextGroups[0].id);
      if (!activeRunId && nextRuns[0]) setActiveRunId(nextRuns[0].id);
    } catch (error: any) {
      if (!quiet) toast.error(error.response?.data?.error || 'Could not load the AI Team workspace.');
    } finally { if (!quiet) setLoading(false); }
  }, [activeRunId, groupId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!runs.some(run => ['queued', 'running'].includes(run.status))) return;
    const timer = window.setInterval(() => void loadData(true), 3000);
    return () => window.clearInterval(timer);
  }, [runs, loadData]);

  const createRun = async () => {
    if (!groupId || objective.trim().length < 20) return toast.error('Select a project and provide a clear objective.');
    setCreating(true);
    try {
      const response = await api.post('/agent-team/runs', {
        group_id: groupId, workflow: 'proposal_review', objective,
        context: {
          project_title: projectTitle, project_summary: projectSummary,
          technology_stack: technologyStack.split(',').map(item => item.trim()).filter(Boolean), submitted_by_role: role,
        },
        constraints: constraints.split('\n').map(item => item.trim()).filter(Boolean),
        selected_agents: AGENTS.map(agent => agent.key),
      });
      const run = response.data.data;
      setRuns(current => [run, ...current.filter(item => item.id !== run.id)]);
      setActiveRunId(run.id); setSelectedTaskKey('head_agent');
      toast.success('AI team deployed. The review is running in the background.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.details?.[0]?.message || 'Could not start the AI team.');
    } finally { setCreating(false); }
  };

  const runAction = async (action: 'cancel' | 'retry') => {
    if (!activeRun) return;
    try {
      const response = await api.post(`/agent-team/runs/${activeRun.id}/${action}`);
      const updated = response.data.data;
      setRuns(current => current.map(item => item.id === updated.id ? updated : item));
      toast.success(action === 'retry' ? 'Run queued for retry.' : 'Run cancelled.');
    } catch (error: any) { toast.error(error.response?.data?.error || `Could not ${action} this run.`); }
  };

  const reviewRun = async (decision: 'approved' | 'rejected' | 'revision_requested') => {
    if (!activeRun) return;
    try {
      const response = await api.post(`/agent-team/runs/${activeRun.id}/review`, { decision, comment: reviewComment });
      const updated = response.data.data;
      setRuns(current => current.map(item => item.id === updated.id ? updated : item)); setReviewComment('');
      toast.success(decision === 'approved' ? 'AI brief approved with a human decision record.' : 'Review decision recorded.');
    } catch (error: any) { toast.error(error.response?.data?.error || 'Could not save the review decision.'); }
  };

  const completedTasks = activeRun?.tasks?.filter(task => task.status === 'completed').length || 0;
  const quality = activeRun?.quality_report_json;

  return <DashboardLayout role={role} title="AI Team">
    <div className="relative min-h-full pb-12">
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-80 overflow-hidden rounded-[32px]" aria-hidden="true"><div className="absolute left-[8%] top-2 h-44 w-44 rounded-full bg-red-300/20 blur-3xl" /><div className="absolute right-[12%] top-8 h-52 w-52 rounded-full bg-blue-300/20 blur-3xl" /></div>
      <header className="relative mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cardinal/15 bg-cardinal/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cardinal"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cardinal opacity-50" /><span className="relative inline-flex h-2 w-2 rounded-full bg-cardinal" /></span>Agent mission control</div><h1 className="font-display text-3xl tracking-tight text-slate-950 sm:text-4xl">One accountable head. Eight exacting specialists.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Evidence-first project review with visible reasoning boundaries, quality gates, and a mandatory faculty decision before consequential use.</p></div>
        <div className="flex flex-wrap items-center gap-2">{activeRun && <StatusPill status={activeRun.status} />}{isLive && <button onClick={() => runAction('cancel')} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-red-200 hover:text-red-700"><Square className="h-3.5 w-3.5" /> Cancel</button>}{activeRun && ['failed', 'cancelled', 'revision_requested'].includes(activeRun.status) && <button onClick={() => runAction('retry')} disabled={serviceStatus?.available === false} title={serviceStatus?.available === false ? serviceStatus.reason || 'AI service unavailable' : undefined} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"><RefreshCcw className="h-3.5 w-3.5" /> Retry run</button>}</div>
      </header>

      <div className="relative grid gap-6 2xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="rounded-[26px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,.08)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cardinal">New mission</p><h2 className="mt-1 font-display text-xl text-slate-950">Deploy the team</h2></div><div className="rounded-2xl bg-slate-950 p-3 text-white"><Play className="h-5 w-5" /></div></div>
            <div className="space-y-4">
              <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Project workspace</span><select value={groupId} onChange={event => setGroupId(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cardinal focus:ring-4 focus:ring-cardinal/10"><option value="">Select a project</option>{groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
              <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Review objective</span><textarea rows={4} value={objective} onChange={event => setObjective(event.target.value)} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-5 text-slate-800 outline-none transition focus:border-cardinal focus:ring-4 focus:ring-cardinal/10" /></label>
              <div className="grid grid-cols-2 gap-3"><label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Project title</span><input value={projectTitle} onChange={event => setProjectTitle(event.target.value)} placeholder="Project name" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-cardinal" /></label><label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Tech stack</span><input value={technologyStack} onChange={event => setTechnologyStack(event.target.value)} placeholder="React, Python" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-cardinal" /></label></div>
              <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Proposal context</span><textarea rows={3} value={projectSummary} onChange={event => setProjectSummary(event.target.value)} placeholder="Problem, users, intended outcome and current progress…" className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-cardinal" /></label>
              <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-700">Constraints <span className="font-normal text-slate-400">one per line</span></span><textarea rows={2} value={constraints} onChange={event => setConstraints(event.target.value)} placeholder="Must run within 12 weeks" className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-cardinal" /></label>
              {serviceStatus && !serviceStatus.available && <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span><strong>AI reviews are temporarily unavailable.</strong><br />{serviceStatus.reason}</span></div>}
              <button onClick={createRun} disabled={creating || !groupId || serviceStatus?.available === false} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-cardinal px-4 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(210,35,42,.25)] transition hover:-translate-y-0.5 hover:bg-cardinal-dark disabled:cursor-not-allowed disabled:opacity-50">{creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}{creating ? 'Deploying agents…' : serviceStatus?.available === false ? 'AI service unavailable' : 'Start evidence review'}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></button>
            </div>
          </section>
          <section className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900">Recent missions</h3><span className="text-[10px] font-semibold text-slate-400">{runs.length} runs</span></div><div className="max-h-80 space-y-2 overflow-y-auto pr-1">{runs.map(run => <button key={run.id} onClick={() => setActiveRunId(run.id)} className={`w-full rounded-2xl border p-3 text-left transition ${activeRun?.id === run.id ? 'border-cardinal/30 bg-cardinal/[0.04] shadow-sm' : 'border-transparent bg-slate-50 hover:border-slate-200'}`}><div className="flex items-start justify-between gap-2"><p className="line-clamp-2 text-xs font-semibold leading-5 text-slate-800">{run.objective}</p><StatusPill status={run.status} /></div><div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400"><Clock3 className="h-3 w-3" />{new Date(run.created_at).toLocaleString()}<span>•</span>{run.group?.name || 'Project'}</div></button>)}{!loading && runs.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-500">No agent missions yet.</div>}</div></section>
        </aside>

        <main className="min-w-0 space-y-6">
          {loading ? <div className="flex min-h-[560px] items-center justify-center rounded-[28px] border border-slate-200 bg-white"><Loader2 className="h-7 w-7 animate-spin text-cardinal" /></div> : !activeRun ? <div className="flex min-h-[560px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white/70 px-8 text-center"><div className="mb-5 rounded-[22px] bg-slate-950 p-5 text-white"><BrainCircuit className="h-8 w-8" /></div><h2 className="font-display text-2xl text-slate-950">{serviceStatus?.available === false ? 'AI service configuration required' : 'Your agent team is ready'}</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{serviceStatus?.available === false ? serviceStatus.reason : 'Select a project, add its current context, and deploy a traceable review mission.'}</p></div> : <>
            {activeRun.status === 'failed' && activeRun.error_message && <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-900"><XCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-bold">This mission could not run</p><p>{activeRun.error_message.includes('ECONNREFUSED') ? 'The AI service was not reachable when this mission started. New missions are disabled until service health is restored.' : activeRun.error_message}</p></div></div>}
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-6"><Metric label="Team progress" value={`${completedTasks}/${activeRun.tasks?.length || 9}`} detail="agents completed" /><Metric label="Confidence" value={`${Math.round((activeRun.confidence || 0) * 100)}%`} detail="evidence calibrated" /><Metric label="Quality gate" value={quality ? `${Math.round((quality.score || 0) * 100)}%` : 'Pending'} detail={quality?.passed ? 'gate passed' : 'faculty review required'} /><Metric label="Evidence coverage" value={quality ? `${Math.round((quality.evidence_coverage || 0) * 100)}%` : '—'} detail="traceable findings" /><Metric label="Token usage" value={(activeRun.token_usage_json?.total_tokens || 0).toLocaleString()} detail="metered tokens" /><Metric label="Estimated cost" value={`$${Number(activeRun.estimated_cost || 0).toFixed(4)}`} detail="configured model rates" /></div>
            <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-[#0c1220] p-5 text-white shadow-[0_28px_80px_rgba(15,23,42,.18)] sm:p-6"><div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40"><Network className="h-3.5 w-3.5" /> Live dependency graph</div><h2 className="mt-2 font-display text-xl">Orchestration flow</h2></div><div className="flex items-center gap-2 text-xs text-white/50"><span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.9)]" />Persistent execution state</div></div><div className="relative grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"><div className="pointer-events-none absolute left-[10%] right-[10%] top-8 hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent xl:block" />{AGENTS.map((agent, index) => { const task = activeRun.tasks?.find(item => item.agent_key === agent.key); const Icon = agent.icon; return <motion.button key={agent.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.045 }} onClick={() => setSelectedTaskKey(agent.key)} className={`relative z-10 rounded-2xl border p-3 text-left transition ${selectedTaskKey === agent.key ? 'border-cardinal/70 bg-white/[0.10] shadow-[0_0_0_1px_rgba(210,35,42,.2)]' : 'border-white/[0.08] bg-white/[0.045] hover:bg-white/[0.08]'}`}><div className="mb-3 flex items-center justify-between"><span className={`rounded-xl p-2 ${task?.status === 'completed' ? 'bg-emerald-400/15 text-emerald-300' : task?.status === 'working' ? 'bg-blue-400/15 text-blue-300' : 'bg-white/[0.07] text-white/55'}`}><Icon className="h-4 w-4" /></span>{task?.status === 'working' ? <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-300" /> : task?.status === 'completed' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> : <CircleDashed className="h-3.5 w-3.5 text-white/25" />}</div><p className="text-xs font-bold text-white">{agent.name}</p><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-white/40">{agent.role}</p></motion.button>; })}</div></section>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(330px,.75fr)]"><section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><AnimatePresence mode="wait"><motion.div key={selectedTaskKey} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}><div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Specialist output</p><h2 className="mt-1 font-display text-xl text-slate-950">{activeTask?.agent_name || AGENTS.find(item => item.key === selectedTaskKey)?.name}</h2></div><StatusPill status={activeTask?.status || 'queued'} /></div>{activeTask?.result_json ? <div className="space-y-5"><p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{activeTask.result_json.summary}</p><div><h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Findings</h3><div className="space-y-2">{activeTask.result_json.findings?.map((finding, index) => <div key={index} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><p className="text-sm font-bold text-slate-900">{finding.title}</p><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${finding.severity === 'high' || finding.severity === 'critical' ? 'bg-red-50 text-red-700' : finding.severity === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{finding.severity}</span></div><p className="mt-2 text-xs leading-5 text-slate-600">{finding.detail}</p>{finding.evidence_ids?.length > 0 && <p className="mt-2 text-[10px] font-semibold text-blue-600">Evidence: {finding.evidence_ids.join(', ')}</p>}</div>)}</div></div>{activeTask.result_json.recommendations?.length ? <div><h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Recommendations</h3><ol className="space-y-2">{activeTask.result_json.recommendations.map((item, index) => <li key={index} className="flex gap-3 text-xs leading-5 text-slate-700"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cardinal/10 text-[10px] font-bold text-cardinal">{index + 1}</span>{item}</li>)}</ol></div> : null}{activeTask.result_json.evidence?.length ? <div><h3 className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Evidence register</h3><div className="grid gap-2 sm:grid-cols-2">{activeTask.result_json.evidence.map(item => <div key={item.id} className="rounded-xl border border-blue-100 bg-blue-50/60 p-3"><div className="flex items-center justify-between gap-2"><p className="text-xs font-bold text-blue-950">{item.title}</p><span className="text-[9px] font-bold uppercase text-blue-500">{item.id}</span></div><p className="mt-1 text-[10px] leading-4 text-blue-800/70">{item.detail || item.type}</p></div>)}</div></div> : null}</div> : <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center"><PauseCircle className="mb-3 h-7 w-7 text-slate-300" /><p className="text-sm font-semibold text-slate-600">Waiting for this specialist</p><p className="mt-1 text-xs text-slate-400">Results appear here as the run progresses.</p></div>}</motion.div></AnimatePresence></section>
              <div className="space-y-6"><section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-3"><div className={`rounded-xl p-2.5 ${quality?.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}><ShieldCheck className="h-5 w-5" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Quality auditor</p><h3 className="font-display text-lg text-slate-950">{quality?.passed ? 'Evidence gate passed' : 'Human judgment required'}</h3></div></div><div className="space-y-2">{quality?.issues?.map((issue, index) => <div key={index} className="flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{issue}</div>)}{!quality && <p className="text-xs leading-5 text-slate-500">The auditor runs after specialist outputs are collected and checks evidence coverage, consistency, and confidence.</p>}</div></section>
                {activeRun.final_report_json && <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-3 flex items-center gap-2"><Gauge className="h-4 w-4 text-cardinal" /><h3 className="text-sm font-bold text-slate-900">Head Agent brief</h3></div><p className="text-xs leading-5 text-slate-600">{activeRun.final_report_json.executive_summary}</p><div className="mt-4 space-y-2">{activeRun.final_report_json.prioritized_actions?.slice(0, 4).map((action, index) => <div key={index} className="flex gap-2 text-xs leading-5 text-slate-700"><span className="font-bold text-cardinal">0{index + 1}</span>{action}</div>)}</div></section>}
                {activeRun.status === 'awaiting_approval' && <section className="rounded-[26px] border border-cardinal/20 bg-gradient-to-br from-white to-red-50/60 p-5 shadow-sm"><div className="mb-4 flex items-center gap-3"><div className="rounded-xl bg-cardinal p-2.5 text-white"><Users className="h-5 w-5" /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cardinal">Human approval</p><h3 className="font-display text-lg text-slate-950">Faculty decision checkpoint</h3></div></div>{canReview ? <><textarea rows={3} value={reviewComment} onChange={event => setReviewComment(event.target.value)} placeholder="Record your evidence-based decision notes…" className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-cardinal" /><div className="mt-3 grid grid-cols-3 gap-2"><button onClick={() => reviewRun('approved')} className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 px-2 py-2.5 text-[10px] font-bold text-white"><Check className="h-3.5 w-3.5" /> Approve</button><button onClick={() => reviewRun('revision_requested')} className="flex items-center justify-center gap-1 rounded-xl bg-amber-500 px-2 py-2.5 text-[10px] font-bold text-white"><RefreshCcw className="h-3.5 w-3.5" /> Revise</button><button onClick={() => reviewRun('rejected')} className="flex items-center justify-center gap-1 rounded-xl bg-slate-900 px-2 py-2.5 text-[10px] font-bold text-white"><XCircle className="h-3.5 w-3.5" /> Reject</button></div></> : <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">This output is advisory. Your assigned mentor or an administrator must approve it before official use.</div>}</section>}
              </div>
            </div>
          </>}
        </main>
      </div>
    </div>
  </DashboardLayout>;
}

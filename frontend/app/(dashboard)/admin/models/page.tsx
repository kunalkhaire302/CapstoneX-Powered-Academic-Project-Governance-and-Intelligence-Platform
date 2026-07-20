'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useCurrentUser } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────
interface AIHealth {
  status: string;
  version: string;
  models: {
    risk_model: string;
    embedding_model: string;
    vector_store_projects: number;
  };
  infrastructure: {
    database: string;
    cache: string;
  };
}

interface ModelEntry {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'active' | 'training' | 'offline' | 'deprecated';
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  latency: string;
  lastTrained: string;
  icon: string;
  category: 'prediction' | 'nlp' | 'embedding' | 'recommendation';
}

// ─── Static model registry (augmented with live health status) ──────────────
const BASE_MODELS: ModelEntry[] = [
  {
    id: 'risk_predictor',
    name: 'Risk Predictor',
    type: 'Random Forest Classifier',
    description: 'Predicts project failure risk using submission rates, login frequency, mentor feedback scores, and days-late metrics.',
    status: 'active',
    version: 'v1.3.2',
    accuracy: 87, precision: 84, recall: 90, f1: 87,
    latency: '~12ms',
    lastTrained: '2026-07-15',
    icon: '⚠️',
    category: 'prediction',
  },
  {
    id: 'embedding_model',
    name: 'Semantic Embeddings',
    type: 'Sentence Transformer (MiniLM-L6)',
    description: 'Generates dense vector embeddings for project topics and descriptions. Powers similarity search and plagiarism detection.',
    status: 'active',
    version: 'v2.0.0',
    accuracy: 91, precision: 89, recall: 93, f1: 91,
    latency: '~45ms',
    lastTrained: '2026-07-10',
    icon: '🧠',
    category: 'embedding',
  },
  {
    id: 'recommendation_engine',
    name: 'Topic Recommender',
    type: 'Cosine Similarity + LLM Reranking',
    description: 'Recommends project topics to student groups based on skill profile, domain interests, and historical success patterns.',
    status: 'active',
    version: 'v1.5.0',
    accuracy: 82, precision: 79, recall: 85, f1: 82,
    latency: '~200ms',
    lastTrained: '2026-07-12',
    icon: '✨',
    category: 'recommendation',
  },
  {
    id: 'nlp_feedback',
    name: 'NLP Feedback Generator',
    type: 'LLM (OpenAI GPT / Gemini)',
    description: 'Generates structured mentor feedback for logbook submissions using large language model inference with role-specific prompting.',
    status: 'active',
    version: 'v1.1.0',
    accuracy: 76, precision: 74, recall: 78, f1: 76,
    latency: '~1.2s',
    lastTrained: '2026-07-01',
    icon: '💬',
    category: 'nlp',
  },
  {
    id: 'plagiarism_detector',
    name: 'Plagiarism Detector',
    type: 'Vector Similarity + Threshold',
    description: 'Detects duplicate or highly similar project proposals by comparing embedding vectors against the entire project corpus.',
    status: 'active',
    version: 'v1.0.1',
    accuracy: 88, precision: 91, recall: 85, f1: 88,
    latency: '~80ms',
    lastTrained: '2026-07-08',
    icon: '🔍',
    category: 'embedding',
  },
  {
    id: 'team_formation',
    name: 'AI Team Formation',
    type: 'Constraint Optimization + Clustering',
    description: 'Auto-forms balanced project groups based on skill diversity, academic performance, domain preferences, and workload balance.',
    status: 'active',
    version: 'v1.2.0',
    accuracy: 84, precision: 81, recall: 87, f1: 84,
    latency: '~350ms',
    lastTrained: '2026-07-05',
    icon: '🤖',
    category: 'recommendation',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  prediction: '#EF4444',
  nlp: '#8B5CF6',
  embedding: '#3B82F6',
  recommendation: '#10B981',
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: 'success' | 'warning' | 'error' | 'default' }> = {
  active:     { label: 'Active',      dot: 'bg-emerald-500', badge: 'success' },
  training:   { label: 'Training',    dot: 'bg-amber-500 animate-pulse', badge: 'warning' },
  offline:    { label: 'Offline',     dot: 'bg-red-500', badge: 'error' },
  deprecated: { label: 'Deprecated',  dot: 'bg-gray-400', badge: 'default' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs font-['Plus_Jakarta_Sans']">
      <p className="font-semibold text-slate-900 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-1.5" style={{ color: p.fill || p.color }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.fill || p.color }} />
          {p.name}: <span className="font-bold ml-1">{p.value}%</span>
        </p>
      ))}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminModelsPage() {
  const user = useCurrentUser();
  const [health, setHealth] = useState<AIHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelEntry | null>(null);
  const [filter, setFilter] = useState<'all' | 'prediction' | 'nlp' | 'embedding' | 'recommendation'>('all');
  const [retraining, setRetraining] = useState<string | null>(null);

  // Merge live health status into model list
  const models: ModelEntry[] = BASE_MODELS.map(m => {
    if (!health) return m;
    if (m.id === 'risk_predictor') return { ...m, status: health.models.risk_model === 'loaded' ? 'active' : 'offline' };
    if (m.id === 'embedding_model') return { ...m, status: health.models.embedding_model === 'loaded' ? 'active' : 'offline' };
    return m;
  });

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get('/ai/health/detailed');
        setHealth(res.data);
      } catch {
        // AI service offline — all models show cached static status
        setHealth(null);
      } finally {
        setHealthLoading(false);
      }
    };
    fetchHealth();
  }, []);

  const handleRetrain = async (modelId: string) => {
    setRetraining(modelId);
    try {
      await api.post(`/ai/retrain/${modelId}`);
      alert(`Retraining triggered for ${models.find(m => m.id === modelId)?.name}. This runs in the background.`);
    } catch {
      alert('Retraining endpoint not yet available on the AI service. The model is currently using its last trained weights.');
    } finally {
      setRetraining(null);
    }
  };

  const filtered = models.filter(m => filter === 'all' || m.category === filter);

  // Overview aggregates
  const activeCount = models.filter(m => m.status === 'active').length;
  const avgAccuracy = Math.round(models.reduce((s, m) => s + m.accuracy, 0) / models.length);
  const vectorCount = health?.models?.vector_store_projects ?? '—';

  const comparisonData = models.map(m => ({
    name: m.name.split(' ')[0],
    Accuracy: m.accuracy,
    'F1 Score': m.f1,
    fill: CATEGORY_COLORS[m.category],
  }));

  const radarData = selectedModel
    ? [
        { metric: 'Accuracy',  value: selectedModel.accuracy },
        { metric: 'Precision', value: selectedModel.precision },
        { metric: 'Recall',    value: selectedModel.recall },
        { metric: 'F1 Score',  value: selectedModel.f1 },
        { metric: 'Speed',     value: selectedModel.latency.includes('ms') ? Math.min(100, 1000 / parseInt(selectedModel.latency)) : 20 },
      ]
    : [];

  return (
    <DashboardLayout role="admin" title="Model Registry" userName={user?.name || 'Admin'}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h2 className="text-2xl font-display text-thunder">AI Model Registry</h2>
          <p className="text-sm text-slate mt-0.5">Monitor, evaluate and manage all deployed AI models</p>
        </div>
        <div className="flex items-center gap-2">
          {healthLoading ? (
            <span className="text-xs text-slate bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">Checking AI service...</span>
          ) : health ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-xs font-semibold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI Service Online · v{health.version}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full text-xs font-semibold text-amber-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              AI Service Offline
            </span>
          )}
        </div>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Deployed Models',    value: models.length,  sub: 'In registry',        icon: '🤖', color: 'from-blue-500 to-blue-600' },
          { label: 'Active Models',      value: activeCount,    sub: 'Currently serving',  icon: '✅', color: 'from-emerald-500 to-emerald-600' },
          { label: 'Avg Accuracy',       value: `${avgAccuracy}%`, sub: 'Across all models', icon: '🎯', color: 'from-violet-500 to-violet-600' },
          { label: 'Vector Store',       value: vectorCount,    sub: 'Projects indexed',   icon: '📦', color: 'from-amber-500 to-amber-600' },
        ].map((k, i) => (
          <Card key={i} className="overflow-hidden relative group">
            <div className={`absolute inset-0 bg-gradient-to-br ${k.color} opacity-0 group-hover:opacity5 transition-opacity duration-300`} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate font-medium uppercase tracking-wide">{k.label}</p>
                <p className="text-3xl font-display text-thunder mt-1.5">{k.value}</p>
                <p className="text-xs text-slate mt-1">{k.sub}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                {k.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* ── Model Comparison Chart ───────────────────────────────── */}
        <Card className="xl:col-span-2">
          <h3 className="text-base font-display text-thunder mb-5">Model Performance Comparison</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 4, right: 8, left: -20, bottom: 4 }} barSize={14} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Accuracy" fill="#D2232A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="F1 Score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-3 justify-center">
            {[{ color: 'bg-cardinal', label: 'Accuracy' }, { color: 'bg-blue-500', label: 'F1 Score' }].map((l, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-slate">
                <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />{l.label}
              </span>
            ))}
          </div>
        </Card>

        {/* ── Infrastructure Health ───────────────────────────────── */}
        <Card>
          <h3 className="text-base font-display text-thunder mb-5">Infrastructure Status</h3>
          <div className="space-y-3">
            {[
              { label: 'AI Service',     value: health ? 'Online' : 'Offline',      ok: !!health },
              { label: 'PostgreSQL DB',  value: health?.infrastructure?.database === 'connected' ? 'Connected' : 'Checking...', ok: health?.infrastructure?.database === 'connected' },
              { label: 'Redis Cache',    value: health?.infrastructure?.cache === 'connected' ? 'Connected' : 'Disabled',       ok: health?.infrastructure?.cache === 'connected' },
              { label: 'Risk Model',     value: health?.models?.risk_model === 'loaded' ? 'Loaded' : 'Not Loaded',               ok: health?.models?.risk_model === 'loaded' },
              { label: 'Embedding Model',value: health?.models?.embedding_model === 'loaded' ? 'Loaded' : 'Not Loaded',         ok: health?.models?.embedding_model === 'loaded' },
              { label: 'Vector Store',   value: `${health?.models?.vector_store_projects ?? 0} projects indexed`,               ok: (health?.models?.vector_store_projects ?? 0) >= 0 },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-slate">{s.label}</span>
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${s.ok ? 'text-emerald-600' : 'text-red-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${s.ok ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  {healthLoading ? '...' : s.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Filter Tabs ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(['all', 'prediction', 'recommendation', 'embedding', 'nlp'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border ${
              filter === f
                ? 'bg-thunder text-white border-thunder shadow-sm'
                : 'text-slate border-gray-200 hover:border-gray-300 hover:text-thunder'
            }`}
          >
            {f === 'all' ? `All Models (${models.length})` : f}
          </button>
        ))}
      </div>

      {/* ── Model Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {filtered.map(m => {
          const sc = STATUS_CONFIG[m.status];
          const catColor = CATEGORY_COLORS[m.category];
          const isSelected = selectedModel?.id === m.id;
          return (
            <Card
              key={m.id}
              className={`cursor-pointer transition-all duration-200 group relative overflow-hidden ${
                isSelected ? 'ring-2 ring-cardinal/40 shadow-lg' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedModel(isSelected ? null : m)}
            >
              {/* Category accent */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: catColor }} />

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                    style={{ background: catColor + '18', border: `1px solid ${catColor}30` }}>
                    {m.icon}
                  </div>
                  <div>
                    <p className="text-sm font-display text-thunder leading-tight">{m.name}</p>
                    <p className="text-[10px] text-slate mt-0.5 font-mono">{m.version}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                  m.status === 'active' ? 'bg-emerald-50 text-emerald-600' :
                  m.status === 'training' ? 'bg-amber-50 text-amber-600' :
                  m.status === 'offline' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                </span>
              </div>

              <p className="text-xs text-slate leading-relaxed mb-4 line-clamp-2">{m.description}</p>

              {/* Metric mini-bars */}
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Accuracy', value: m.accuracy, color: '#D2232A' },
                  { label: 'F1 Score', value: m.f1, color: '#3B82F6' },
                ].map((met, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate w-14 flex-shrink-0">{met.label}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${met.value}%`, background: met.color }} />
                    </div>
                    <span className="text-[10px] font-semibold text-thunder w-8 text-right">{met.value}%</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-slate">Latency: <span className="font-semibold text-thunder">{m.latency}</span></p>
                  <p className="text-[10px] text-slate">Trained: <span className="font-semibold text-thunder">{m.lastTrained}</span></p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleRetrain(m.id); }}
                  disabled={retraining === m.id}
                  className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-gray-50 border border-gray-200 text-slate hover:border-cardinal/40 hover:text-cardinal hover:bg-cardinal-50/40 transition-all disabled:opacity-50"
                >
                  {retraining === m.id ? 'Triggering...' : '↻ Retrain'}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Model Detail Panel (shown when a model is selected) ──────── */}
      {selectedModel && (
        <Card className="animate-fade-in">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow"
                style={{ background: CATEGORY_COLORS[selectedModel.category] + '18', border: `1px solid ${CATEGORY_COLORS[selectedModel.category]}30` }}>
                {selectedModel.icon}
              </div>
              <div>
                <h3 className="text-xl font-display text-thunder">{selectedModel.name}</h3>
                <p className="text-sm text-slate mt-0.5">{selectedModel.type}</p>
              </div>
            </div>
            <button onClick={() => setSelectedModel(null)}
              className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-slate hover:text-thunder transition-colors text-lg">
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Radar chart */}
            <div>
              <h4 className="text-sm font-semibold text-thunder mb-4">Performance Radar</h4>
              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Radar dataKey="value" stroke="#D2232A" fill="#D2232A" fillOpacity={0.15} strokeWidth={2}
                      dot={{ r: 4, fill: '#D2232A', strokeWidth: 0 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed metrics */}
            <div>
              <h4 className="text-sm font-semibold text-thunder mb-4">Detailed Metrics</h4>
              <div className="space-y-4">
                {[
                  { label: 'Accuracy',  value: selectedModel.accuracy,  color: 'bg-cardinal' },
                  { label: 'Precision', value: selectedModel.precision, color: 'bg-violet-500' },
                  { label: 'Recall',    value: selectedModel.recall,    color: 'bg-blue-500' },
                  { label: 'F1 Score',  value: selectedModel.f1,        color: 'bg-emerald-500' },
                ].map((met, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate font-medium">{met.label}</span>
                      <span className="font-bold text-thunder">{met.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${met.color} rounded-full transition-all duration-700`}
                        style={{ width: `${met.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                {[
                  { label: 'Version',      value: selectedModel.version },
                  { label: 'Avg Latency',  value: selectedModel.latency },
                  { label: 'Category',     value: selectedModel.category },
                  { label: 'Last Trained', value: selectedModel.lastTrained },
                ].map((info, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate uppercase tracking-wider mb-0.5">{info.label}</p>
                    <p className="text-sm font-semibold text-thunder capitalize">{info.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-sm text-slate mt-5 bg-gray-50 rounded-xl p-4 leading-relaxed">
            📖 <span className="font-medium text-thunder">Description:</span> {selectedModel.description}
          </p>
        </Card>
      )}

    </DashboardLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ScoreCard, { OverallScoreGauge } from '@/components/ui/ScoreCard';
import RecommendationRadar from '@/components/ui/RadarChart';
import SimilarProjectsPanel from '@/components/ui/SimilarProjectsPanel';
import AISuggestionsPanel from '@/components/ui/AISuggestionsPanel';
import api from '@/lib/api';
import {
  Brain, Target, Fingerprint, Lightbulb, TrendingUp,
  CheckCircle, Code, Briefcase, Sparkles, Save,
  RotateCcw, Send, ArrowLeft, Loader2,
} from 'lucide-react';

interface Scores {
  domain_match: number;
  uniqueness: number;
  innovation: number;
  impact: number;
  feasibility: number;
  skill_match: number;
  commercial_potential: number;
  overall: number;
}

interface RecommendationReport {
  scores: Scores;
  similar_projects: any[];
  ai_suggestions: any;
  sdg_alignment: string[];
  keywords: string[];
  domain_analysis: any;
  warnings: any[];
  total_projects_compared: number;
  model_version: string;
  problem_statement_id?: string;
  recommendation_id?: string;
  version?: number;
}

interface FormData {
  title: string;
  problem_statement: string;
  description: string;
  domain: string;
  department: string;
  skills: string;
  tech_stack: string;
  hackathon_theme: string;
  expected_users: string;
  target_audience: string;
  expected_impact: string;
  duration: string;
  team_members: string;
}

const initialFormData: FormData = {
  title: '',
  problem_statement: '',
  description: '',
  domain: '',
  department: '',
  skills: '',
  tech_stack: '',
  hackathon_theme: '',
  expected_users: '',
  target_audience: '',
  expected_impact: '',
  duration: '',
  team_members: '',
};

const SCORE_META: { key: keyof Omit<Scores, 'overall'>; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: 'domain_match', label: 'Domain Match', icon: <Target className="w-5 h-5" />, desc: 'Alignment with your field' },
  { key: 'uniqueness', label: 'Uniqueness', icon: <Fingerprint className="w-5 h-5" />, desc: 'Differentiation from existing' },
  { key: 'innovation', label: 'Innovation', icon: <Lightbulb className="w-5 h-5" />, desc: 'Novelty & creative approach' },
  { key: 'impact', label: 'Impact', icon: <TrendingUp className="w-5 h-5" />, desc: 'Real-world value' },
  { key: 'feasibility', label: 'Feasibility', icon: <CheckCircle className="w-5 h-5" />, desc: 'Can you build this?' },
  { key: 'skill_match', label: 'Skill Match', icon: <Code className="w-5 h-5" />, desc: 'Team skill coverage' },
  { key: 'commercial_potential', label: 'Commercial', icon: <Briefcase className="w-5 h-5" />, desc: 'Market viability' },
];

export default function RecommendationsPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [report, setReport] = useState<RecommendationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState('');

  // Determine which view to show
  const showReport = !!report;

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const parseList = (str: string): string[] =>
    str.split(',').map(s => s.trim()).filter(Boolean);

  const handleAnalyze = async () => {
    if (!formData.title || !formData.problem_statement) {
      setError('Title and Problem Statement are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        problem_statement: formData.problem_statement,
        description: formData.description,
        domain: formData.domain,
        department: formData.department,
        skills: parseList(formData.skills),
        tech_stack: parseList(formData.tech_stack),
        hackathon_theme: formData.hackathon_theme,
        expected_users: formData.expected_users,
        target_audience: formData.target_audience,
        expected_impact: formData.expected_impact,
        duration: formData.duration,
        team_members: formData.team_members ? parseList(formData.team_members).map(name => ({ name, skills: [] })) : [],
      };

      const res = await api.post('/recommend', payload);
      setReport(res.data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');

      // Fallback: try AI service directly
      try {
        const payload = {
          title: formData.title,
          problem_statement: formData.problem_statement,
          description: formData.description,
          domain: formData.domain,
          department: formData.department,
          skills: parseList(formData.skills),
          tech_stack: parseList(formData.tech_stack),
          hackathon_theme: formData.hackathon_theme,
          expected_users: formData.expected_users,
          target_audience: formData.target_audience,
          expected_impact: formData.expected_impact,
          duration: formData.duration,
          team_members: [],
        };

        const res = await aiApi.post('/api/ai/problem/analyze', payload);
        setReport(res.data);
        setError('');
      } catch (fallbackErr) {
        console.error('Fallback analysis also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.title) {
      setError('Title is required to save a draft.');
      return;
    }
    setSavingDraft(true);
    try {
      await api.post('/problem/draft', {
        title: formData.title,
        problem_statement: formData.problem_statement,
        description: formData.description,
        domain: formData.domain,
        department: formData.department,
        skills: parseList(formData.skills),
        tech_stack: parseList(formData.tech_stack),
        hackathon_theme: formData.hackathon_theme,
        expected_users: formData.expected_users,
        target_audience: formData.target_audience,
        expected_impact: formData.expected_impact,
        duration: formData.duration,
        team_members: formData.team_members ? parseList(formData.team_members).map(name => ({ name, skills: [] })) : [],
      });
    } catch (err) {
      console.error('Draft save error:', err);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleImprove = async () => {
    if (!report) return;
    setLoading(true);
    try {
      const res = await api.post('/problem/improve', {
        title: formData.title,
        problem_statement: formData.problem_statement,
        description: formData.description,
        domain: formData.domain,
        tech_stack: parseList(formData.tech_stack),
        scores: report.scores,
        similar_projects: report.similar_projects,
        problem_statement_id: report.problem_statement_id,
      });
      setReport(prev => prev ? {
        ...prev,
        ai_suggestions: { ...prev.ai_suggestions, ...res.data },
      } : null);
    } catch (err) {
      console.error('Improve error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReAnalyze = () => {
    setReport(null);
    setError('');
  };

  return (
    <DashboardLayout role="student" title="AI Recommendations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-cardinal/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-cardinal" />
            </div>
            <div>
              <h1 className="text-2xl font-display text-thunder">
                {showReport ? 'Recommendation Report' : 'Analyze Your Idea'}
              </h1>
              <p className="text-sm text-slate">
                {showReport
                  ? `Version ${report?.version || 1} • ${report?.total_projects_compared || 0} projects compared`
                  : 'Get AI-powered analysis of your hackathon/project idea before submission'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ──────────────── INPUT FORM VIEW ──────────────── */}
        {!showReport && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column — Core Info */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-base font-display text-thunder mb-4">Project Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-thunder mb-1.5">Project Title *</label>
                      <Input
                        value={formData.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('title', e.target.value)}
                        placeholder="e.g., AI-Powered Smart Campus Navigation"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-thunder mb-1.5">Problem Statement *</label>
                      <textarea
                        value={formData.problem_statement}
                        onChange={(e) => handleChange('problem_statement', e.target.value)}
                        placeholder="What specific problem does your project solve?"
                        rows={3}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cardinal/20 focus:border-cardinal outline-none transition-all resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-thunder mb-1.5">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Provide a detailed description of your project..."
                        rows={4}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cardinal/20 focus:border-cardinal outline-none transition-all resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-thunder mb-1.5">Domain</label>
                        <Input
                          value={formData.domain}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('domain', e.target.value)}
                          placeholder="e.g., Machine Learning"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-thunder mb-1.5">Department</label>
                        <Input
                          value={formData.department}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('department', e.target.value)}
                          placeholder="e.g., Computer Science"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h2 className="text-base font-display text-thunder mb-4">Impact & Audience</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-thunder mb-1.5">Target Audience</label>
                      <Input
                        value={formData.target_audience}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('target_audience', e.target.value)}
                        placeholder="e.g., College students in urban areas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-thunder mb-1.5">Expected Users</label>
                      <Input
                        value={formData.expected_users}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('expected_users', e.target.value)}
                        placeholder="e.g., 10,000+ students across 50 campuses"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-thunder mb-1.5">Expected Impact</label>
                      <textarea
                        value={formData.expected_impact}
                        onChange={(e) => handleChange('expected_impact', e.target.value)}
                        placeholder="Describe the real-world impact: who benefits, how, and how much..."
                        rows={3}
                        className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cardinal/20 focus:border-cardinal outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column — Technical Details */}
              <div className="space-y-6">
                <Card className="p-6">
                  <h2 className="text-base font-display text-thunder mb-4">Technical Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-thunder mb-1.5">Your Skills</label>
                      <Input
                        value={formData.skills}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('skills', e.target.value)}
                        placeholder="Comma-separated: Python, React, TensorFlow"
                      />
                      <p className="text-xs text-slate mt-1">Separate multiple skills with commas</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-thunder mb-1.5">Technology Stack</label>
                      <Input
                        value={formData.tech_stack}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('tech_stack', e.target.value)}
                        placeholder="Comma-separated: React, Node.js, PostgreSQL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-thunder mb-1.5">Team Members</label>
                      <Input
                        value={formData.team_members}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('team_members', e.target.value)}
                        placeholder="Comma-separated: Alice, Bob, Charlie"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-thunder mb-1.5">Hackathon Theme</label>
                        <Input
                          value={formData.hackathon_theme}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('hackathon_theme', e.target.value)}
                          placeholder="e.g., Smart City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-thunder mb-1.5">Duration</label>
                        <Input
                          value={formData.duration}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('duration', e.target.value)}
                          placeholder="e.g., 48 hours"
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAnalyze}
                    disabled={loading || !formData.title || !formData.problem_statement}
                    className="flex-1 bg-cardinal hover:bg-cardinal-dark text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Analyze Idea
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSaveDraft}
                    disabled={savingDraft || !formData.title}
                    className="px-6 bg-surface text-thunder hover:bg-gray-200 py-3 rounded-lg font-medium flex items-center gap-2 transition-all"
                  >
                    {savingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Draft
                  </Button>
                </div>

                {/* Tip box */}
                <div className="bg-cardinal/5 border border-cardinal/10 rounded-lg p-4">
                  <p className="text-xs text-cardinal font-semibold mb-1">💡 Tips for better analysis</p>
                  <ul className="text-xs text-slate space-y-1">
                    <li>• Be specific in your problem statement — vague ideas get lower scores</li>
                    <li>• List all planned technologies — it improves feasibility scoring</li>
                    <li>• Describe your target audience in detail for better impact analysis</li>
                    <li>• Include expected impact metrics for higher commercial scores</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────── REPORT VIEW ──────────────── */}
        {showReport && report && (
          <div className="animate-fade-in space-y-6">
            {/* Action bar */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={handleReAnalyze}
                className="px-4 py-2 bg-surface text-thunder hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Edit & Re-analyze
              </Button>
              <Button
                onClick={handleImprove}
                disabled={loading}
                className="px-4 py-2 bg-cardinal text-white hover:bg-cardinal-dark rounded-lg text-sm font-medium flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Improve Idea
              </Button>
              <Button
                onClick={handleSaveDraft}
                className="px-4 py-2 bg-surface text-thunder hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Draft
              </Button>
            </div>

            {/* Warnings */}
            {report.warnings?.map((w, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border text-sm ${
                  w.severity === 'critical'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}
              >
                {w.message}
              </div>
            ))}

            {/* Overall Score + Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 flex items-center justify-center">
                <OverallScoreGauge score={report.scores.overall} />
              </Card>
              <div className="lg:col-span-2">
                <RecommendationRadar scores={report.scores} />
              </div>
            </div>

            {/* Score Cards Grid */}
            <div>
              <h2 className="text-base font-display text-thunder mb-4">Detailed Scores</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {SCORE_META.map((meta, idx) => (
                  <ScoreCard
                    key={meta.key}
                    label={meta.label}
                    score={report.scores[meta.key]}
                    icon={meta.icon}
                    description={meta.desc}
                    delay={idx}
                  />
                ))}
              </div>
            </div>

            {/* SDG + Keywords Row */}
            {(report.sdg_alignment?.length > 0 || report.keywords?.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {report.sdg_alignment?.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-base font-display text-thunder mb-3">SDG Alignment</h3>
                    <div className="flex flex-wrap gap-2">
                      {report.sdg_alignment.map((sdg, i) => (
                        <span key={i} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-medium">
                          {sdg}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}
                {report.keywords?.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-base font-display text-thunder mb-3">Extracted Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {report.keywords.map((kw, i) => (
                        <span key={i} className="text-xs bg-surface text-slate border border-gray-200 px-2.5 py-1 rounded-md">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Similar Projects + AI Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SimilarProjectsPanel projects={report.similar_projects} />
              <AISuggestionsPanel suggestions={report.ai_suggestions} />
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && !report && (
          <div className="fixed inset-0 bg-thunder/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col items-center gap-4 max-w-sm mx-4">
              <div className="w-16 h-16 rounded-full bg-cardinal/10 flex items-center justify-center">
                <Brain className="w-8 h-8 text-cardinal animate-pulse" />
              </div>
              <h3 className="text-lg font-display text-thunder">Analyzing Your Idea</h3>
              <p className="text-sm text-slate text-center">
                Running 12-step recommendation pipeline...
                <br />
                This may take a few seconds.
              </p>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-cardinal rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

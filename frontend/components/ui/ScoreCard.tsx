'use client';

import { ReactNode } from 'react';

interface ScoreCardProps {
  label: string;
  score: number;
  icon?: ReactNode;
  description?: string;
  delay?: number;
}

/**
 * ScoreCard — Animated score display with color-coded progress bar.
 * Used in the recommendation dashboard to show individual dimension scores.
 *
 * Color logic:
 *  - Red (0-39):   Needs improvement
 *  - Yellow (40-69): Moderate
 *  - Green (70-100): Strong
 */
export default function ScoreCard({ label, score, icon, description, delay = 0 }: ScoreCardProps) {
  const getColor = (s: number) => {
    if (s >= 70) return { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (s >= 40) return { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    return { bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
  };

  const getLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 70) return 'Strong';
    if (s >= 55) return 'Good';
    if (s >= 40) return 'Moderate';
    if (s >= 25) return 'Weak';
    return 'Critical';
  };

  const color = getColor(score);

  return (
    <div
      className={`bg-white border border-gray-100 rounded-xl p-5 shadow-card hover:shadow-card-hover hover:-translate-y-[2px] transition-all duration-300 animate-fade-in group`}
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate">{label}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-display text-thunder">{score}</span>
            <span className="text-sm text-slate">/100</span>
          </div>
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg ${color.light} ${color.text} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className={`absolute left-0 top-0 h-full ${color.bg} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${score}%`, transitionDelay: `${delay * 0.1 + 0.3}s` }}
        />
      </div>

      <div className="flex justify-between items-center">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${color.light} ${color.text}`}>
          {getLabel(score)}
        </span>
        {description && (
          <span className="text-xs text-slate truncate ml-2 max-w-[140px]" title={description}>
            {description}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * OverallScoreGauge — Large circular gauge for the overall recommendation score.
 */
export function OverallScoreGauge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 70) return '#10B981';
    if (s >= 40) return '#F59E0B';
    return '#EF4444';
  };

  const getLabel = (s: number) => {
    if (s >= 80) return 'Highly Recommended';
    if (s >= 65) return 'Recommended';
    if (s >= 50) return 'Needs Work';
    if (s >= 35) return 'Significant Gaps';
    return 'Not Ready';
  };

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle cx="60" cy="60" r="54" fill="none" stroke="#E2E8F0" strokeWidth="8" />
          {/* Score arc */}
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1500 ease-out"
            style={{ transitionDelay: '0.5s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-display text-thunder">{score}</span>
          <span className="text-xs text-slate">/ 100</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold" style={{ color }}>
        {getLabel(score)}
      </p>
      <p className="text-xs text-slate mt-1">Overall Recommendation Score</p>
    </div>
  );
}

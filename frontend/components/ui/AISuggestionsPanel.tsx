'use client';

import { useState } from 'react';
import {
  Lightbulb, AlertCircle, Puzzle, Star, Rocket,
  Code, Briefcase, Users, ShieldAlert, ArrowUpCircle,
  Globe, Layers, Database, ChevronDown, ChevronUp,
} from 'lucide-react';

interface AISuggestions {
  strengths?: string[];
  weaknesses?: string[];
  missing_features?: string[];
  unique_features?: string[];
  future_scope?: string[];
  tech_recommendations?: string[];
  business_model_suggestions?: string[];
  potential_users?: string[];
  risks?: string[];
  improvement_suggestions?: string[];
  recommended_apis?: string[];
  recommended_frameworks?: string[];
  recommended_datasets?: string[];
}

interface AISuggestionsPanelProps {
  suggestions: AISuggestions;
}

interface SectionProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
  color: string;
  defaultOpen?: boolean;
}

function SuggestionSection({ title, items, icon, color, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (!items || items.length === 0) return null;

  return (
    <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${open ? 'border-gray-200 shadow-sm' : 'border-gray-100'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-surface/50 transition-colors duration-150"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
          </div>
          <span className="text-sm font-semibold text-thunder">{title}</span>
          <span className="text-xs text-slate bg-surface px-1.5 py-0.5 rounded">{items.length}</span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100">
          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-gray-700 animate-fade-in"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cardinal mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * AISuggestionsPanel — Collapsible accordion displaying all AI-generated suggestions.
 * 13 categories organized in a clean expandable UI.
 */
export default function AISuggestionsPanel({ suggestions }: AISuggestionsPanelProps) {
  if (!suggestions) return null;

  const sections: SectionProps[] = [
    { title: 'Strengths', items: suggestions.strengths || [], icon: <Star className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-600', defaultOpen: true },
    { title: 'Weaknesses', items: suggestions.weaknesses || [], icon: <AlertCircle className="w-4 h-4" />, color: 'bg-red-50 text-red-500', defaultOpen: true },
    { title: 'Improvement Suggestions', items: suggestions.improvement_suggestions || [], icon: <ArrowUpCircle className="w-4 h-4" />, color: 'bg-cardinal-50 text-cardinal', defaultOpen: true },
    { title: 'Missing Features', items: suggestions.missing_features || [], icon: <Puzzle className="w-4 h-4" />, color: 'bg-amber-50 text-amber-600' },
    { title: 'Unique Features', items: suggestions.unique_features || [], icon: <Lightbulb className="w-4 h-4" />, color: 'bg-purple-50 text-purple-600' },
    { title: 'Future Scope', items: suggestions.future_scope || [], icon: <Rocket className="w-4 h-4" />, color: 'bg-blue-50 text-blue-600' },
    { title: 'Technology Recommendations', items: suggestions.tech_recommendations || [], icon: <Code className="w-4 h-4" />, color: 'bg-indigo-50 text-indigo-600' },
    { title: 'Business Model Suggestions', items: suggestions.business_model_suggestions || [], icon: <Briefcase className="w-4 h-4" />, color: 'bg-teal-50 text-teal-600' },
    { title: 'Potential Users', items: suggestions.potential_users || [], icon: <Users className="w-4 h-4" />, color: 'bg-sky-50 text-sky-600' },
    { title: 'Risks', items: suggestions.risks || [], icon: <ShieldAlert className="w-4 h-4" />, color: 'bg-orange-50 text-orange-600' },
    { title: 'Recommended APIs', items: suggestions.recommended_apis || [], icon: <Globe className="w-4 h-4" />, color: 'bg-cyan-50 text-cyan-600' },
    { title: 'Recommended Frameworks', items: suggestions.recommended_frameworks || [], icon: <Layers className="w-4 h-4" />, color: 'bg-violet-50 text-violet-600' },
    { title: 'Recommended Datasets', items: suggestions.recommended_datasets || [], icon: <Database className="w-4 h-4" />, color: 'bg-lime-50 text-lime-600' },
  ];

  const activeSections = sections.filter(s => s.items.length > 0);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-display text-thunder">AI Suggestions</h3>
        <span className="text-xs text-slate">
          {activeSections.length} categories
        </span>
      </div>
      <div className="space-y-2">
        {activeSections.map((section, idx) => (
          <SuggestionSection key={idx} {...section} />
        ))}
      </div>
    </div>
  );
}

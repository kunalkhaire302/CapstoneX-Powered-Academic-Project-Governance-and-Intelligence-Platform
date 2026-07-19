'use client';

import { AlertTriangle, ExternalLink } from 'lucide-react';

interface SimilarProject {
  id: string;
  title: string;
  domain: string;
  similarity: number;
  reason: string;
}

interface SimilarProjectsPanelProps {
  projects: SimilarProject[];
}

/**
 * SimilarProjectsPanel — Displays top similar projects with similarity percentages.
 * Shows warning banners for >90% similarity.
 */
export default function SimilarProjectsPanel({ projects }: SimilarProjectsPanelProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-card">
        <h3 className="text-base font-display text-thunder mb-3">Similar Projects</h3>
        <p className="text-sm text-slate">No similar projects found. Your idea appears to be unique!</p>
      </div>
    );
  }

  const hasHighSimilarity = projects.some(p => p.similarity > 90);
  const hasModerateSimilarity = projects.some(p => p.similarity > 75);

  const getBarColor = (similarity: number) => {
    if (similarity >= 90) return 'bg-red-500';
    if (similarity >= 75) return 'bg-amber-500';
    if (similarity >= 50) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getBadgeColor = (similarity: number) => {
    if (similarity >= 90) return 'bg-red-50 text-red-700 border-red-200';
    if (similarity >= 75) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (similarity >= 50) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-display text-thunder">Similar Projects</h3>
        <span className="text-xs text-slate bg-surface px-2 py-1 rounded-md">
          {projects.length} found
        </span>
      </div>

      {/* High similarity warning */}
      {hasHighSimilarity && (
        <div className="flex items-start gap-3 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">High Similarity Detected</p>
            <p className="text-xs text-red-600 mt-0.5">
              Your idea is very similar to existing projects. Consider adding unique features or focusing on a different niche to differentiate.
            </p>
          </div>
        </div>
      )}

      {!hasHighSimilarity && hasModerateSimilarity && (
        <div className="flex items-start gap-3 p-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700">Moderate Similarity</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Some similar projects exist. Adding unique features is recommended.
            </p>
          </div>
        </div>
      )}

      {/* Project list */}
      <div className="space-y-3">
        {projects.map((project, index) => (
          <div
            key={project.id || index}
            className="group border border-gray-100 rounded-lg p-4 hover:border-gray-200 hover:shadow-sm transition-all duration-200 animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-thunder truncate">{project.title}</h4>
                </div>
                {project.domain && (
                  <span className="inline-block text-xs bg-surface text-slate px-2 py-0.5 rounded mt-1">
                    {project.domain}
                  </span>
                )}
                <p className="text-xs text-slate mt-2 line-clamp-2">{project.reason}</p>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className={`text-xs font-bold px-2 py-1 rounded-md border ${getBadgeColor(project.similarity)}`}>
                  {project.similarity}%
                </span>
              </div>
            </div>

            {/* Similarity bar */}
            <div className="mt-3 relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full ${getBarColor(project.similarity)} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${project.similarity}%`, transitionDelay: `${index * 0.1}s` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

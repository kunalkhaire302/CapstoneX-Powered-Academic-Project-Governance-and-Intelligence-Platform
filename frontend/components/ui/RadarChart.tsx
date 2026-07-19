'use client';

import {
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface RecommendationRadarProps {
  scores: {
    domain_match: number;
    uniqueness: number;
    innovation: number;
    impact: number;
    feasibility: number;
    skill_match: number;
    commercial_potential: number;
    overall: number;
  };
}

/**
 * RecommendationRadar — Radar chart showing all 8 recommendation dimensions.
 * Styled to match CapstoneX design system (cardinal red, Plus Jakarta Sans).
 */
export default function RecommendationRadar({ scores }: RecommendationRadarProps) {
  const data = [
    { dimension: 'Domain Match', score: scores.domain_match, fullMark: 100 },
    { dimension: 'Uniqueness', score: scores.uniqueness, fullMark: 100 },
    { dimension: 'Innovation', score: scores.innovation, fullMark: 100 },
    { dimension: 'Impact', score: scores.impact, fullMark: 100 },
    { dimension: 'Feasibility', score: scores.feasibility, fullMark: 100 },
    { dimension: 'Skill Match', score: scores.skill_match, fullMark: 100 },
    { dimension: 'Commercial', score: scores.commercial_potential, fullMark: 100 },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-card">
      <h3 className="text-base font-display text-thunder mb-4">Score Distribution</h3>
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'Plus Jakarta Sans' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              tickCount={5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: 'Plus Jakarta Sans',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
              }}
              formatter={(value: number) => [`${value}/100`, 'Score']}
            />
            <Radar
              name="Scores"
              dataKey="score"
              stroke="#D2232A"
              fill="#D2232A"
              fillOpacity={0.15}
              strokeWidth={2}
              dot={{ r: 4, fill: '#D2232A', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#B01E24', strokeWidth: 2, stroke: '#fff' }}
            />
          </RechartsRadar>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

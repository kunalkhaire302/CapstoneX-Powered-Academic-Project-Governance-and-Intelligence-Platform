'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({ children, className = '', hover = true, padding = 'md' }: CardProps) {
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' };

  return (
    <div
      className={`bg-white rounded-lg border border-border shadow-card ${
        hover ? 'hover:shadow-card-hover hover:-translate-y-[1px]' : ''
      } transition-all duration-200 ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  icon?: ReactNode;
}

export function StatCard({ label, value, trend, icon }: StatCardProps) {
  return (
    <Card className="animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate font-medium">{label}</p>
          <p className="mt-2 text-3xl font-display animate-count-up">{value}</p>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              <span className="text-slate ml-1">vs last week</span>
            </p>
          )}
        </div>
        {icon && <div className="p-2 bg-cardinal-50 rounded-lg text-cardinal">{icon}</div>}
      </div>
    </Card>
  );
}

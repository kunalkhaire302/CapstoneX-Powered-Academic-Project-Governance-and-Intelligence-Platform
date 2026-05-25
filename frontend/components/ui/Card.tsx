'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'gradient' | 'outlined';
}

export default function Card({ children, className = '', hover = true, padding = 'md', variant = 'default' }: CardProps) {
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' };

  const variants = {
    default: 'bg-white border border-gray-100 shadow-card',
    glass: 'glass',
    gradient: 'bg-gradient-to-br from-white to-gray-50/80 border border-gray-100 shadow-card',
    outlined: 'bg-white border-2 border-gray-200',
  };

  return (
    <div
      className={`rounded-xl ${variants[variant]} ${
        hover ? 'hover:shadow-card-hover hover:-translate-y-[2px]' : ''
      } transition-all duration-300 ease-out ${paddings[padding]} ${className}`}
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
  iconBg?: string;
  delay?: number;
}

export function StatCard({ label, value, trend, icon, iconBg = 'bg-cardinal-50 text-cardinal', delay = 0 }: StatCardProps) {
  return (
    <Card className="animate-fade-in group" style={{ animationDelay: `${delay * 0.08}s` } as any}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate font-medium">{label}</p>
          <p className="mt-2 text-3xl font-display text-thunder animate-count-up">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                trend.positive 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'bg-red-50 text-red-500'
              }`}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate">vs last week</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

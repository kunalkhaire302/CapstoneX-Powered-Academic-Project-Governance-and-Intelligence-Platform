'use client';

import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'gradient' | 'outlined';
}

export default function Card({ children, className = '', hover = false, padding = 'md', variant = 'default', ...props }: CardProps) {
  const paddings = { sm: 'p-4', md: 'p-6', lg: 'p-8' };

  const variants = {
    default: 'bg-white/90 border border-slate-200/70 shadow-[0_1px_2px_rgba(15,23,42,.03),0_8px_30px_rgba(15,23,42,.035)]',
    glass: 'bg-white/65 backdrop-blur-xl border border-white/80 shadow-[0_18px_45px_rgba(15,23,42,.08)]',
    gradient: 'bg-gradient-to-br from-white via-white to-slate-50/80 border border-slate-200/70 shadow-[0_12px_35px_rgba(15,23,42,.055)]',
    outlined: 'bg-white/60 border border-slate-300/80',
  };

  return (
    <div
      className={`rounded-[18px] ${variants[variant]} ${
        hover ? 'hover:border-slate-300/80 hover:shadow-[0_18px_42px_rgba(15,23,42,.08)] hover:-translate-y-0.5' : ''
      } transition-[transform,box-shadow,border-color] duration-300 ease-out ${paddings[padding]} ${className}`}
      {...props}
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
    <Card className="animate-fade-in group" style={{ animationDelay: `${delay * 0.08}s` }}>
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

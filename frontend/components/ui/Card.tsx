'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'glass' | 'gradient' | 'outlined';
}

export default function Card({ 
  children, 
  className = '', 
  hover = false, 
  padding = 'md', 
  variant = 'default', 
  ...props 
}: CardProps) {
  const paddings = { 
    none: 'p-0',
    sm: 'p-4', 
    md: 'p-6', 
    lg: 'p-8' 
  };

  const variants = {
    default: 'card',
    glass: 'bg-white/65 backdrop-blur-xl border border-white/80 shadow-md rounded-2xl',
    gradient: 'bg-gradient-surface border border-cx-border rounded-2xl shadow-sm',
    outlined: 'bg-transparent border border-cx-border rounded-2xl',
  };

  return (
    <div
      className={cn(
        variants[variant],
        hover && 'card-interactive',
        paddings[padding],
        className
      )}
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
  className?: string;
}

export function StatCard({ 
  label, 
  value, 
  trend, 
  icon, 
  iconBg = 'bg-brand-50 text-brand', 
  delay = 0,
  className = ''
}: StatCardProps) {
  return (
    <Card 
      className={cn('animate-fade-in group hover:-translate-y-1 transition-transform duration-300', className)} 
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-cx-text-secondary">{label}</p>
          <p className="mt-2 text-3xl font-display text-cx-text animate-count-up">{value}</p>
          
          {trend && (
            <div className="mt-2.5 flex items-center gap-2">
              <span className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded-md',
                trend.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
              )}>
                {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-cx-text-muted">vs last period</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110',
            iconBg
          )}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { FileText, Users, Search, Target, Clock } from 'lucide-react';

export function QuickActions() {
  const actions = [
    { label: 'Submit Logbook', icon: <FileText className="w-5 h-5" />, href: '/student/logbook', color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200' },
    { label: 'Find a Group', icon: <Users className="w-5 h-5" />, href: '/student/groups', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 hover:border-blue-200' },
    { label: 'Explore Topics', icon: <Search className="w-5 h-5" />, href: '/student/topics', color: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200' },
    { label: 'AI Insights', icon: <Target className="w-5 h-5" />, href: '/student/recommendations', color: 'bg-brand-light text-brand-700 border-brand-200 hover:bg-brand-100 hover:border-brand-300' }
  ];

  return (
    <Card className="h-full">
      <h3 className="text-lg font-display text-cx-text font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => (
          <Link key={i} href={action.href}>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer h-full ${action.color}`}
            >
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export function UpcomingDeadlines() {
  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-display text-cx-text font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Upcoming Deadlines
        </h3>
      </div>
      <div className="rounded-xl border border-dashed border-cx-border p-5 text-sm leading-6 text-cx-text-secondary">Deadlines are not shown because CapstoneX does not currently provide a schedule API. No dates are fabricated here.</div>
    </Card>
  );
}

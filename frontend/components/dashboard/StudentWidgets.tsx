'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { FileText, Users, Search, Target, Clock, ArrowRight } from 'lucide-react';

export function QuickActions() {
  const actions = [
    { label: 'Submit Logbook', icon: <FileText className="w-5 h-5" />, href: '/student/logbook', color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200' },
    { label: 'Find a Group', icon: <Users className="w-5 h-5" />, href: '/student/groups', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 hover:border-blue-200' },
    { label: 'Explore Topics', icon: <Search className="w-5 h-5" />, href: '/student/topics', color: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200' },
    { label: 'AI Insights', icon: <Target className="w-5 h-5" />, href: '/student/recommendations', color: 'bg-cardinal-50 text-cardinal border-cardinal/20 hover:bg-cardinal/10 hover:border-cardinal/30' }
  ];

  return (
    <Card className="h-full">
      <h3 className="text-lg font-display text-thunder mb-4">Quick Actions</h3>
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
  const deadlines = [
    { title: 'Project Proposal Submission', date: 'Oct 15, 2026', time: '11:59 PM', urgent: true },
    { title: 'Mid-term Evaluation', date: 'Nov 10, 2026', time: 'TBD', urgent: false },
    { title: 'Final Report Draft', date: 'Dec 05, 2026', time: '11:59 PM', urgent: false }
  ];

  return (
    <Card className="h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-display text-thunder flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Upcoming Deadlines
        </h3>
      </div>
      <div className="relative border-l-2 border-gray-100 ml-3 space-y-6">
        {deadlines.map((item, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="relative pl-6"
          >
            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white ${item.urgent ? 'bg-cardinal' : 'bg-gray-300'}`} />
            <h4 className={`text-sm font-semibold ${item.urgent ? 'text-thunder' : 'text-slate'}`}>{item.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${item.urgent ? 'bg-cardinal-50 text-cardinal' : 'bg-gray-100 text-slate'}`}>
                {item.date}
              </span>
              <span className="text-xs text-slate">{item.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <button className="w-full mt-6 text-sm text-slate hover:text-thunder transition-colors flex items-center justify-center gap-1">
        View Full Timeline <ArrowRight className="w-4 h-4" />
      </button>
    </Card>
  );
}

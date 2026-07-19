'use client';

import React from 'react';
import DashboardLayout, { useUserProfile } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/Card';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useApi } from '@/lib/hooks';
import { motion } from 'framer-motion';
import { QuickActions, UpcomingDeadlines } from '@/components/dashboard/StudentWidgets';
import { Sparkles, Users, FileCheck, Target, TrendingUp, Bell, ChevronRight, Activity } from 'lucide-react';
import Link from 'next/link';

function WelcomeBanner() {
  const { userProfile } = useUserProfile();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 bg-gradient-to-br from-[#0F172A] via-[#1e293b] to-[#0F172A] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl"
    >
      {/* Abstract Background Elements */}
      <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-cardinal/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-50%] left-[10%] w-64 h-64 bg-blue-500/20 rounded-full blur-[60px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-2"
          >
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cardinal-300" />
              Capstone Journey
            </span>
          </motion.div>
          <h2 className="text-3xl font-display font-bold mb-2">
            {greeting}, {userProfile.name.split(' ')[0]} 👋
          </h2>
          <p className="text-slate-300 max-w-lg">
            Stay on top of your project milestones. You have pending evaluations to review and logbooks to submit this week.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const { data: dashboardData, loading: dashboardLoading } = useApi<any>('/users/dashboard/student');
  const { data: recData, loading: recLoading } = useApi<any>('/student/recommendations');

  const stats = dashboardData?.stats || {
    groupsJoined: 0,
    logbooksSubmitted: 0,
    pendingEvaluations: 0,
    overallScore: 0
  };

  const recentActivity = dashboardData?.recentActivity || [];
  const recommendations = recData?.recommendations?.slice(0, 3) || [];

  const statCards = [
    { label: 'Groups Joined', value: stats.groupsJoined, iconBg: 'bg-blue-50 text-blue-600', icon: <Users className="w-6 h-6" /> },
    { label: 'Logbooks Submitted', value: stats.logbooksSubmitted, iconBg: 'bg-emerald-50 text-emerald-600', icon: <FileCheck className="w-6 h-6" /> },
    { label: 'Pending Evaluations', value: stats.pendingEvaluations, iconBg: 'bg-amber-50 text-amber-600', icon: <Target className="w-6 h-6" /> },
    { label: 'Overall Score', value: `${stats.overallScore}%`, iconBg: 'bg-violet-50 text-violet-600', icon: <TrendingUp className="w-6 h-6" /> },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <DashboardLayout role="student" title="Student Dashboard">
      <WelcomeBanner />

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {statCards.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <StatCard 
              label={stat.label} 
              value={dashboardLoading ? '...' : stat.value} 
              icon={stat.icon} 
              iconBg={stat.iconBg} 
              delay={0} 
            />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <QuickActions />

          {/* Recent Activity */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-display text-thunder flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Recent Activity
              </h3>
              <Link href="/student/notifications" className="text-xs text-cardinal font-medium hover:underline">View All</Link>
            </div>
            
            {dashboardLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-2">
                {recentActivity.map((activity: any, index: number) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={activity.id} 
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer group border border-transparent hover:border-gray-100"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-thunder truncate">{activity.action}</p>
                      <p className="text-xs text-slate">{new Date(activity.time).toLocaleDateString()}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate/40 group-hover:text-thunder transition-colors" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate">
                <p className="text-sm">No recent activity found.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="flex flex-col gap-6">
          <UpcomingDeadlines />

          {/* AI Recommendations */}
          <Card>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-display text-thunder flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cardinal" />
                AI Insights
              </h3>
            </div>
            <p className="text-xs text-slate mb-5">Project domains matching your profile</p>
            
            {recLoading ? (
               <div className="animate-pulse space-y-3">
                 {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
               </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="p-3.5 rounded-xl border border-gray-100 hover:border-cardinal/30 hover:bg-cardinal-50/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-thunder truncate mr-2">{rec.domain || rec.title}</p>
                      <Badge variant="success">{Math.round((rec.score || 0.85) * 100)}%</Badge>
                    </div>
                    {/* Score bar */}
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mb-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${(rec.score || 0.85) * 100}%` }} />
                    </div>
                    <p className="text-xs text-slate line-clamp-2">{rec.reason || 'Matches your profile.'}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate bg-gray-50 rounded-xl">
                <Sparkles className="w-6 h-6 text-slate/40 mx-auto mb-2" />
                <p className="text-xs">No AI recommendations yet.<br/>Update your profile to get started.</p>
              </div>
            )}
            
            <Link href="/student/recommendations">
              <button className="w-full mt-4 text-sm text-cardinal font-semibold hover:text-cardinal-hover transition-colors flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-cardinal-50">
                Explore Recommendations
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

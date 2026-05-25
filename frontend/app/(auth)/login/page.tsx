'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      const redirectMap: Record<string, string> = {
        student: '/student', mentor: '/mentor', coordinator: '/coordinator',
        hod: '/coordinator', admin: '/admin', accreditation: '/coordinator',
      };
      window.location.href = redirectMap[data.user.role] || '/student';
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F172A] via-[#1a2744] to-[#0F172A] relative overflow-hidden items-center justify-center">
        <div className="absolute top-20 left-20 w-72 h-72 bg-cardinal/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/[0.03] rounded-full" />

        <div className="relative z-10 p-12 text-white max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/10">
              <img src="/logo.png" alt="CX" className="w-8 h-8 object-contain brightness-0 invert" />
            </div>
            <div>
              <span className="font-display text-2xl block leading-tight">CapstoneX</span>
              <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider">AI Platform</span>
            </div>
          </div>
          <h1 className="text-4xl font-display mb-4 leading-tight">Welcome back to<br /><span className="text-cardinal-400">CapstoneX</span></h1>
          <p className="text-white/50 text-lg leading-relaxed mb-12">
            AI-powered academic project governance platform. Manage your capstone journey with intelligent insights.
          </p>
          <div className="flex gap-8">
            {[{ value: '4', label: 'AI Modules' }, { value: '6', label: 'User Roles' }, { value: '100%', label: 'Automated' }].map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-display text-white">{s.value}</p>
                <p className="text-xs text-white/30 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cardinal to-cardinal-600 flex items-center justify-center shadow-glow">
              <img src="/logo.png" alt="CX" className="w-7 h-7 object-contain brightness-0 invert" />
            </div>
            <span className="font-display text-xl text-thunder">CapstoneX</span>
          </div>

          <h2 className="text-2xl font-display text-thunder mb-1">Sign in to your account</h2>
          <p className="text-slate text-sm mb-8">Enter your credentials to access your dashboard</p>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2 animate-scale-in">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-card space-y-5">
            <Input label="Email Address" type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required id="login-email" />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required id="login-password" />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-cardinal focus:ring-cardinal" id="remember-me" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-cardinal hover:text-cardinal-hover font-semibold transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading} id="login-submit">Sign In</Button>

            <div className="mt-4 border-t border-gray-100 pt-5">
              <p className="text-[11px] text-slate/70 font-semibold mb-3 text-center uppercase tracking-wider">Demo Credentials (CapstoneX@2024)</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { role: 'Student', email: 'student1@capstonex.com' },
                  { role: 'Mentor', email: 'mentor1@capstonex.com' },
                  { role: 'Coord', email: 'coord1@capstonex.com' },
                  { role: 'HOD', email: 'hod@capstonex.com' },
                  { role: 'Admin', email: 'admin@capstonex.com' }
                ].map(demo => (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => {
                      setEmail(demo.email);
                      setPassword('CapstoneX@2024');
                    }}
                    className="px-2.5 py-1 text-xs bg-gray-50 border border-gray-200 text-slate hover:bg-cardinal-50 hover:text-cardinal hover:border-cardinal/30 rounded-md transition-colors font-medium"
                  >
                    {demo.role}
                  </button>
                ))}
              </div>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-slate">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-cardinal font-semibold hover:text-cardinal-hover transition-colors">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

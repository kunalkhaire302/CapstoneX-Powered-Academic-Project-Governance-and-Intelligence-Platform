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
      // Redirect based on role
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
    <div className="min-h-screen bg-surface flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-thunder relative overflow-hidden items-center justify-center">
        <div className="relative z-10 p-12 text-white max-w-md">
          <img src="/logo-full.png" alt="CapstoneX" className="w-56 mb-8 drop-shadow-[0_4px_24px_rgba(255,255,255,0.25)]" />
          <h1 className="text-4xl font-display mb-4">Welcome to CapstoneX</h1>
          <p className="text-white/70 text-lg leading-relaxed">
            AI-powered academic project governance platform. Manage your capstone journey with intelligent insights.
          </p>
          <div className="mt-12 flex gap-6">
            <div>
              <p className="text-3xl font-display">4</p>
              <p className="text-xs text-white/50 mt-1">AI Modules</p>
            </div>
            <div>
              <p className="text-3xl font-display">6</p>
              <p className="text-xs text-white/50 mt-1">User Roles</p>
            </div>
            <div>
              <p className="text-3xl font-display">100%</p>
              <p className="text-xs text-white/50 mt-1">Automated</p>
            </div>
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cardinal/20 rounded-full blur-3xl" />
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-cardinal/10 rounded-full blur-2xl" />
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <img src="/logo-full.png" alt="CapstoneX" className="w-44 mb-6 drop-shadow-md" />
          </div>

          <h2 className="text-2xl font-display text-thunder mb-1">Sign in to your account</h2>
          <p className="text-slate text-sm mb-8">Enter your credentials to access your dashboard</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-cardinal">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="login-email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password"
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate">
                <input type="checkbox" className="rounded border-border" id="remember-me" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-cardinal hover:text-cardinal-hover font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" loading={loading} id="login-submit">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-cardinal font-medium hover:text-cardinal-hover">
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

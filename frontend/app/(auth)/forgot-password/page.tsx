'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cardinal to-cardinal-600 flex items-center justify-center shadow-glow">
              <img src="/logo.png" alt="CX" className="w-8 h-8 object-contain brightness-0 invert" />
            </div>
          </div>
          <h2 className="text-2xl font-display text-thunder">Reset Password</h2>
          <p className="text-slate text-sm mt-1">We&apos;ll send you a reset link</p>
        </div>
        {sent ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-card text-center animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h3 className="text-lg font-display text-thunder mb-2">Check your email</h3>
            <p className="text-sm text-slate mb-6">If an account with this email exists, a reset link has been sent. Check your inbox.</p>
            <Link href="/login" className="btn-primary inline-block">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-card space-y-5">
            <Input label="Email" type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} required id="forgot-email" />
            <Button type="submit" className="w-full" size="lg" loading={loading}>Send Reset Link</Button>
            <p className="text-center text-sm text-slate">
              <Link href="/login" className="text-cardinal hover:text-cardinal-hover font-semibold transition-colors">Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

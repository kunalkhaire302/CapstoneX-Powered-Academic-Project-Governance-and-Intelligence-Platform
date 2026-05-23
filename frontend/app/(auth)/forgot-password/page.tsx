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
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-cardinal rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">CX</span>
          </div>
          <h2 className="text-2xl font-display text-thunder">Reset Password</h2>
        </div>
        {sent ? (
          <div className="bg-white rounded-lg border border-border p-8 shadow-card text-center">
            <div className="text-4xl mb-4">✉️</div>
            <p className="text-sm text-slate">If an account with this email exists, a reset link has been sent. Check your inbox.</p>
            <Link href="/login" className="btn-primary mt-6 inline-block">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-border p-8 shadow-card space-y-5">
            <Input label="Email" type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} required id="forgot-email" />
            <Button type="submit" className="w-full" loading={loading}>Send Reset Link</Button>
            <p className="text-center text-sm text-slate">
              <Link href="/login" className="text-cardinal hover:text-cardinal-hover font-medium">Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

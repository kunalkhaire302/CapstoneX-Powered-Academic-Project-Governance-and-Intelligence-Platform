'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import AuthFrame from '@/components/auth/AuthFrame';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { apiBaseUrl } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const response = await fetch(`${apiBaseUrl}/auth/forgot-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (!response.ok) throw new Error('Recovery is temporarily unavailable. Please try again.');
      setSent(true);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Could not reach the recovery service.'); }
    finally { setLoading(false); }
  };
  return <AuthFrame eyebrow="Account recovery" title="Reset your password." description="Enter your institutional email and we’ll send a secure reset link if an account exists." footer={<Link href="/login" className="inline-flex items-center gap-2 font-semibold text-brand-700 hover:text-brand-800"><ArrowLeft className="h-4 w-4" /> Back to sign in</Link>}>
    {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {sent ? <div className="py-7 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></span><h3 className="mt-5 font-display text-2xl">Check your inbox.</h3><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">If this email is registered, a reset link is on its way. It may take a few minutes to arrive.</p></div> : <form onSubmit={handleSubmit} className="space-y-6"><Input label="Institutional email" type="email" placeholder="you@university.edu" value={email} onChange={event => setEmail(event.target.value)} required id="forgot-email" icon={<Mail className="h-4 w-4" />} helperText="We’ll never reveal whether an email is registered." /><Button type="submit" className="w-full" size="lg" loading={loading}>Send secure reset link</Button></form>}
  </AuthFrame>;
}

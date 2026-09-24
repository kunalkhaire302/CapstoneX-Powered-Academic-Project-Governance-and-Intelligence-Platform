'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import AuthFrame from '@/components/auth/AuthFrame';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api, { setStoredAccessToken } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', department: '' });
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const update = (field: keyof typeof form, value: string) => setForm(current => ({ ...current, [field]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (form.password.length < 8) return setError('Use at least 8 characters for your password.');
    setLoading(true); setError('');
    try { const { data } = await api.post('/auth/register', { ...form, role: 'student' }); setStoredAccessToken(data.accessToken); localStorage.setItem('user', JSON.stringify(data.user)); router.replace('/student'); }
    catch (caught: any) { setError(caught.response?.data?.error || 'Your account could not be created.'); }
    finally { setLoading(false); }
  };
  return <AuthFrame eyebrow="New workspace" title="Create your account." description="Start a role-aware workspace for your capstone project journey." footer={<>Already have an account? <Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">Sign in</Link></>}>
    {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
    <form onSubmit={submit} className="space-y-4"><Input label="Full name" placeholder="Your name" value={form.name} onChange={event => update('name', event.target.value)} required id="register-name" icon={<UserRound className="h-4 w-4" />} /><Input label="Institutional email" type="email" placeholder="you@university.edu" value={form.email} onChange={event => update('email', event.target.value)} required id="register-email" icon={<Mail className="h-4 w-4" />} /><div className="grid gap-4 sm:grid-cols-2"><Input label="Password" type="password" placeholder="8+ characters" value={form.password} onChange={event => update('password', event.target.value)} required id="register-password" icon={<LockKeyhole className="h-4 w-4" />} /><Input label="Confirm password" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={event => update('confirmPassword', event.target.value)} required id="register-confirm" /></div><Input label="Department" placeholder="Computer Science" value={form.department} onChange={event => update('department', event.target.value)} id="register-dept" icon={<Building2 className="h-4 w-4" />} /><div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600"><span className="font-semibold text-slate-900">Student registration.</span> Mentor and administrator access is issued by an institutional administrator.</div><Button type="submit" className="mt-2 w-full" size="lg" loading={loading}>Create student account</Button></form>
  </AuthFrame>;
}

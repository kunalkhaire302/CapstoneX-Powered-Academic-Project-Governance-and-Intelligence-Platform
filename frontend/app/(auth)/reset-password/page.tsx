'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Eye, EyeOff, KeyRound, ShieldAlert } from 'lucide-react';
import AuthFrame from '@/components/auth/AuthFrame';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import api from '@/lib/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');

  const passwordError = useMemo(() => {
    if (!password) return '';
    if (password.length < 8) return 'Use at least 8 characters.';
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      return 'Include upper and lowercase letters plus a number.';
    }
    return '';
  }, [password]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!token) return setError('This reset link is incomplete. Request a new one.');
    if (passwordError) return setError(passwordError);
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setComplete(true);
      window.setTimeout(() => router.replace('/login?reset=success'), 1800);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'This reset link is invalid or expired. Request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame eyebrow="Secure recovery" title="Choose a new password." description="Your reset link is single-use and expires automatically.">
      {complete ? (
        <div className="py-8 text-center" role="status">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-8 w-8" /></span>
          <h3 className="mt-5 font-display text-2xl">Password updated.</h3>
          <p className="mt-2 text-sm text-slate-600">Taking you back to secure sign in…</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          {!token && <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" /><p>This link has no reset token. <Link href="/forgot-password" className="font-bold underline">Request another link</Link>.</p></div>}
          {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div>}
          <Input label="New password" id="new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} error={passwordError} icon={<KeyRound className="h-4 w-4" />} trailingIcon={<button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>} required />
          <Input label="Confirm password" id="confirm-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} error={confirmPassword && confirmPassword !== password ? 'Passwords do not match.' : ''} required />
          <Button type="submit" size="lg" className="w-full" loading={loading} disabled={!token || Boolean(passwordError)}>Update password securely</Button>
          <p className="text-center text-sm text-slate-600"><Link href="/login" className="font-semibold text-brand-700 hover:text-brand-800">Return to sign in</Link></p>
        </form>
      )}
    </AuthFrame>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<p role="status">Loading recovery form…</p>}><ResetPasswordForm /></Suspense>;
}

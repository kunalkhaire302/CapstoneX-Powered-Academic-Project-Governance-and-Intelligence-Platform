'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Eye, EyeOff, GraduationCap, Loader2, Lock, Mail, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { apiBaseUrl, setStoredAccessToken } from '@/lib/api';

type Role = 'student' | 'mentor' | 'admin';
type LoginUser = { id: string; name: string; email: string; role: Role; department?: string };
type LoginResponse = { accessToken?: string; error?: string; user?: LoginUser };
type AuthenticatedLoginResponse = { accessToken: string; user: LoginUser };

const DEMO_PASSWORD = 'CapstoneX@2024';
const roles: Record<Role, string> = { student: '/student', mentor: '/mentor', admin: '/admin' };
const demos = [
  { role: 'student' as Role, title: 'Student', email: 'student1@capstonex.com', caption: 'Open my project space', icon: GraduationCap },
  { role: 'mentor' as Role, title: 'Mentor', email: 'mentor1@capstonex.com', caption: 'Review project teams', icon: Users },
  { role: 'admin' as Role, title: 'Administrator', email: 'admin@capstonex.com', caption: 'Oversee the platform', icon: ShieldCheck },
];

const wait = (milliseconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
const isTransientSignInFailure = (error: unknown) =>
  error instanceof TypeError || (error instanceof DOMException && error.name === 'AbortError') ||
  (error instanceof Error && 'transient' in error && error.transient === true);

async function requestLogin(loginEmail: string, loginPassword: string): Promise<AuthenticatedLoginResponse> {
  let lastNetworkError: unknown;

  // Render may need a moment to wake an idle service. A single, short retry
  // makes the first sign-in reliable without ever retrying invalid credentials.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(apiBaseUrl + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim().toLowerCase(), password: loginPassword }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({})) as LoginResponse;

      if (!response.ok || !data.accessToken || !data.user) {
        const error = new Error(data.error || 'Sign-in could not be completed (HTTP ' + response.status + ').') as Error & { transient?: boolean };
        error.transient = response.status >= 500;
        throw error;
      }
      return { accessToken: data.accessToken, user: data.user };
    } catch (error) {
      lastNetworkError = error;
      // An HTTP response is a real login outcome, so do not send it again.
      if (!isTransientSignInFailure(error)) throw error;
      if (attempt === 0) await wait(900);
    } finally {
      window.clearTimeout(timeout);
    }
  }

  throw lastNetworkError;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [error, setError] = useState('');

  const authenticate = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setLoading(true);
    try {
      // Login uses the returned access token directly. It does not depend on
      // third-party refresh cookies or any Firebase client state.
      const data = await requestLogin(loginEmail, loginPassword);
      setStoredAccessToken(data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.replace(roles[data.user.role]);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Unable to contact CapstoneX.';
      setError(isTransientSignInFailure(caughtError)
        ? 'The secure sign-in service is taking longer than usual. Please try again in a moment.'
        : message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (event: React.FormEvent) => {
    event.preventDefault();
    await authenticate(email, password);
  };

  const openDemo = async (role: Role, demoEmail: string) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    await authenticate(demoEmail, DEMO_PASSWORD);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f6f2] text-thunder">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#0d1b2a] px-10 py-10 text-white lg:flex lg:flex-col xl:px-16 xl:py-14">
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:46px_46px]" />
          <div className="absolute -left-28 top-28 h-80 w-80 rounded-full bg-brand-500/30 blur-[110px]" />
          <div className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-amber-300/10 blur-[120px]" />

          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="relative flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/10 shadow-inner">
              <img src="/logo.png" alt="CapstoneX" className="h-6 w-6 object-contain brightness-0 invert" />
            </div>
            <div>
              <p className="font-display text-2xl leading-none">CapstoneX</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Academic intelligence</p>
            </div>
          </motion.div>

          <div className="relative my-auto max-w-xl py-16">
            <motion.p initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12, duration: 0.55 }} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Project governance, made visible
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.65 }} className="font-display text-5xl leading-[0.98] tracking-tight xl:text-6xl">
              The calm control room for ambitious capstone work.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.55 }} className="mt-7 max-w-lg text-base leading-7 text-slate-300">
              Bring students, mentors, evidence and decisions into one accountable project journey.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42, duration: 0.55 }} className="mt-11 grid grid-cols-3 gap-3">
              {[['AI team', 'Evidence-led reviews'], ['Live status', 'Milestones in view'], ['Human approval', 'Decisions stay yours']].map(([title, caption]) => (
                <div key={title} className="border-l border-white/20 pl-3">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{caption}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }} className="relative flex items-center gap-2 text-xs text-slate-400">
            <Check className="h-4 w-4 text-emerald-300" />
            Secure, role-aware access for every project team.
          </motion.div>
        </section>

        <section className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-brand-100/70 blur-[100px]" />
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="relative w-full max-w-[470px]">
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <div className="flex items-center gap-2.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-thunder"><img src="/logo.png" alt="CapstoneX" className="h-5 w-5 brightness-0 invert" /></div>
                <span className="font-display text-xl">CapstoneX</span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Academic intelligence</span>
            </div>

            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Welcome back</p>
              <h2 className="mt-3 font-display text-4xl tracking-tight text-[#172331]">Enter your workspace.</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">Use your CapstoneX account, or use a safe demo workspace to explore the platform.</p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <p className="font-semibold">Sign-in needs attention</p>
                  <p className="mt-1 leading-5 text-red-700">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={signIn} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_55px_-32px_rgba(15,23,42,.32)] sm:p-7">
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Institutional email</span>
                  <span className="relative block">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input id="login-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@university.edu" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100" />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-slate-600"><span>Password</span><Link href="/forgot-password" className="normal-case tracking-normal text-brand-700 hover:text-brand-800">Forgot password?</Link></span>
                  <span className="relative block">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100" />
                    <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  </span>
                </label>
              </div>
              <button id="login-submit" type="submit" disabled={loading} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-thunder text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-[#1c3147] disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing you in…</> : <>Sign in securely <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <div className="mt-6">
              <div className="flex items-center gap-3"><div className="h-px flex-1 bg-slate-200" /><span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Explore the demo</span><div className="h-px flex-1 bg-slate-200" /></div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {demos.map((demo, index) => {
                  const Icon = demo.icon;
                  const active = selectedRole === demo.role;
                  const classes = active
                    ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-100'
                    : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card';
                  return (
                    <motion.button key={demo.role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 + index * 0.07 }} type="button" disabled={loading} onClick={() => openDemo(demo.role, demo.email)} className={'group rounded-2xl border p-3 text-left transition ' + classes}>
                      <span className="flex items-center justify-between"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-700 transition group-hover:bg-thunder group-hover:text-white"><Icon className="h-4 w-4" /></span><ArrowRight className="h-3.5 w-3.5 text-slate-400" /></span>
                      <span className="mt-3 block text-sm font-bold text-slate-800">{demo.title}</span>
                      <span className="mt-1 block text-[11px] leading-4 text-slate-500">{demo.caption}</span>
                    </motion.button>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-xs text-slate-500">Demo access signs in immediately — no extra password step.</p>
            </div>

            <p className="mt-8 text-center text-sm text-slate-600">New to CapstoneX? <Link href="/register" className="font-semibold text-brand-700 hover:text-brand-800">Create your account</Link></p>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

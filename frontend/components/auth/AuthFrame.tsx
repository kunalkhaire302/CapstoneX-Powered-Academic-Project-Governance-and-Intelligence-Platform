'use client';

import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

type AuthFrameProps = { eyebrow: string; title: string; description: string; children: React.ReactNode; footer?: React.ReactNode };

const promises = [
  { icon: ShieldCheck, label: 'Role-aware', copy: 'Every workspace is scoped' },
  { icon: CheckCircle2, label: 'Evidence-led', copy: 'Decisions are traceable' },
  { icon: ArrowUpRight, label: 'In motion', copy: 'Milestones stay visible' },
];

export default function AuthFrame({ eyebrow, title, description, children, footer }: AuthFrameProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f5f1] text-[#172331]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[1.06fr_.94fr]">
        <section className="relative hidden overflow-hidden bg-[#0b1725] p-12 text-white lg:flex lg:flex-col xl:p-16">
          <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px)] [background-size:46px_46px]" />
          <div className="absolute -left-28 top-24 h-80 w-80 rounded-full bg-brand/25 blur-[110px]" /><div className="absolute bottom-[-9rem] right-[-5rem] h-[30rem] w-[30rem] rounded-full bg-sky-400/10 blur-[120px]" />
          <Link href="/login" className="relative flex w-fit items-center gap-3" aria-label="CapstoneX home"><span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/10"><img src="/logo.png" alt="" className="h-6 w-6 brightness-0 invert" /></span><span><b className="font-display text-2xl font-normal">CapstoneX</b><small className="mt-1 block text-[9px] font-bold uppercase tracking-[.25em] text-white/45">Academic intelligence</small></span></Link>
          <div className="relative my-auto max-w-xl py-14"><motion.p initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-xs text-slate-200"><Sparkles className="h-3.5 w-3.5 text-amber-300" /> Built for accountable project work</motion.p><motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }} className="mt-7 font-display text-5xl leading-[.98] tracking-tight xl:text-6xl">A clearer path from proposal to proof.</motion.h1><p className="mt-7 max-w-lg text-base leading-7 text-slate-300">One operating space for project teams, mentors, evidence, approvals and meaningful progress.</p><div className="mt-12 grid gap-4 sm:grid-cols-3">{promises.map(({ icon: Icon, label, copy }) => <div key={label} className="border-l border-white/20 pl-3"><Icon className="h-4 w-4 text-brand-300" /><p className="mt-3 text-sm font-semibold">{label}</p><p className="mt-1 text-xs leading-5 text-white/45">{copy}</p></div>)}</div></div>
          <p className="relative text-xs text-white/40">Private by design · Human decisions remain human</p>
        </section>
        <section className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12"><div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-brand-100/60 blur-[100px]" /><motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-[500px]"><div className="mb-10 flex items-center gap-2.5 lg:hidden"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0b1725]"><img src="/logo.png" alt="" className="h-5 w-5 brightness-0 invert" /></span><span className="font-display text-xl">CapstoneX</span></div><p className="text-xs font-bold uppercase tracking-[.2em] text-brand-700">{eyebrow}</p><h2 className="mt-3 font-display text-4xl tracking-tight">{title}</h2><p className="mt-3 max-w-md text-sm leading-6 text-slate-600">{description}</p><div className="mt-7 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_55px_-32px_rgba(15,23,42,.32)] sm:p-7">{children}</div>{footer && <div className="mt-7 text-center text-sm text-slate-600">{footer}</div>}</motion.div></section>
      </div>
    </main>
  );
}

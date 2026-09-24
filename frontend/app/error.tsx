'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { /* Error reporting can be connected here without exposing user data. */ }, []);
  return <main className="grid min-h-screen place-items-center bg-[#0b1725] p-6 text-white"><div className="max-w-md text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-white/5 text-brand-300"><AlertTriangle className="h-8 w-8" /></span><p className="mt-8 text-[10px] font-bold uppercase tracking-[.25em] text-white/45">CapstoneX workspace</p><h1 className="mt-3 font-display text-4xl">This page needs a fresh start.</h1><p className="mt-4 text-sm leading-6 text-slate-300">Your work is safe. Try loading the workspace again, and contact your institution if the issue continues.</p><button onClick={reset} className="mx-auto mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold shadow-lg shadow-brand/25 hover:bg-brand-600"><RefreshCw className="h-4 w-4" /> Reload workspace</button></div></main>;
}

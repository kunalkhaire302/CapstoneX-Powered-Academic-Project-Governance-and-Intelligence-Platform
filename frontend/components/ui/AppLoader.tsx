'use client';

import { motion } from 'framer-motion';

interface AppLoaderProps {
  compact?: boolean;
  label?: string;
}

export default function AppLoader({ compact = false, label = 'Preparing your workspace' }: AppLoaderProps) {
  return (
    <div
      className={`${compact ? 'absolute pointer-events-none' : 'fixed'} inset-0 z-[100] grid place-items-center overflow-hidden bg-[#080c17] text-white`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="loader-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cardinal/10 blur-[100px]" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col items-center"
      >
        <div className="relative grid h-24 w-24 place-items-center" aria-hidden="true">
          <div className="loader-orbit absolute inset-0 rounded-full border border-white/10" />
          <div className="loader-orbit-reverse absolute inset-[10px] rounded-full border border-cardinal/30" />
          <div className="absolute grid h-12 w-12 place-items-center rounded-[14px] border border-white/15 bg-white/[0.07] shadow-[0_0_40px_rgba(210,35,42,.25)] backdrop-blur-xl">
            <span className="font-display text-xl italic">X</span>
          </div>
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-cardinal shadow-[0_0_18px_rgba(255,72,79,.9)]" />
        </div>

        <div className="mt-7 text-center">
          <p className="font-display text-2xl tracking-[-0.02em]">Capstone<span className="text-cardinal-400">X</span></p>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.28em] text-white/40">{label}</p>
        </div>

        <div className="mt-7 h-px w-40 overflow-hidden bg-white/10" aria-hidden="true">
          <div className="loader-progress h-full w-1/2 bg-gradient-to-r from-transparent via-cardinal to-transparent" />
        </div>
      </motion.div>
      <span className="sr-only">Loading</span>
    </div>
  );
}

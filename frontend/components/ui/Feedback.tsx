import { AlertCircle, Inbox, Loader2, RefreshCw, type LucideIcon } from 'lucide-react';
import Button from './Button';

type Tone = 'info' | 'success' | 'warning' | 'danger';

const tones: Record<Tone, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-950',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
  danger: 'border-red-200 bg-red-50 text-red-950',
};

export function Alert({ title, children, tone = 'info' }: { title: string; children?: React.ReactNode; tone?: Tone }) {
  return <div role={tone === 'danger' ? 'alert' : 'status'} className={`flex gap-3 rounded-[var(--radius-lg)] border p-4 ${tones[tone]}`}>
    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
    <div><p className="text-sm font-bold">{title}</p>{children && <div className="mt-1 text-sm leading-6 opacity-80">{children}</div>}</div>
  </div>;
}

export function EmptyState({ title, description, action, icon: Icon = Inbox }: { title: string; description: string; action?: React.ReactNode; icon?: LucideIcon }) {
  return <div className="flex min-h-64 flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Icon className="h-5 w-5" aria-hidden="true" /></span>
    <h2 className="mt-4 font-display text-xl text-slate-950">{title}</h2>
    <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>;
}

export function ErrorState({ title = 'This information could not be loaded', description, onRetry }: { title?: string; description: string; onRetry?: () => void }) {
  return <div role="alert" className="flex min-h-64 flex-col items-center justify-center rounded-[var(--radius-xl)] border border-red-200 bg-red-50/70 px-6 py-12 text-center">
    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-red-600 shadow-sm"><AlertCircle className="h-5 w-5" aria-hidden="true" /></span>
    <h2 className="mt-4 font-display text-xl text-slate-950">{title}</h2>
    <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
    {onRetry && <Button className="mt-5" variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={onRetry}>Try again</Button>}
  </div>;
}

export function LoadingState({ label = 'Loading workspace data', rows = 0 }: { label?: string; rows?: number }) {
  return <div role="status" aria-live="polite" className="rounded-[var(--radius-xl)] border border-slate-200 bg-white/70 p-6 text-sm font-semibold text-slate-600">
    <div className="flex items-center justify-center gap-3"><Loader2 className="h-5 w-5 animate-spin text-brand" aria-hidden="true" />{label}</div>
    {rows > 0 && <div className="mt-6 space-y-3" aria-hidden="true">{Array.from({ length: rows }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />)}</div>}
  </div>;
}

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem { label: string; href?: string }

export default function PageHeader({ eyebrow, title, description, breadcrumbs = [], actions }: { eyebrow?: string; title: string; description?: string; breadcrumbs?: BreadcrumbItem[]; actions?: React.ReactNode }) {
  return <header className="mb-7 border-b border-slate-200/80 pb-6">
    {breadcrumbs.length > 0 && <nav aria-label="Breadcrumb" className="mb-4"><ol className="flex flex-wrap items-center gap-1 text-xs text-slate-500">{breadcrumbs.map((item, index) => <li key={`${item.label}-${index}`} className="flex items-center gap-1">{index > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" aria-hidden="true" />}{item.href ? <Link href={item.href} className="rounded font-semibold text-slate-600 hover:text-cardinal focus-visible:outline-cardinal">{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav>}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">{eyebrow && <p className="text-[10px] font-bold uppercase tracking-[.2em] text-cardinal">{eyebrow}</p>}<h1 className="mt-1 font-display text-3xl tracking-tight text-slate-950 sm:text-4xl">{title}</h1>{description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}</div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  </header>;
}

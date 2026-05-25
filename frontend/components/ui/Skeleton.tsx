'use client';

export default function Skeleton({ className = '', width, height }: { className?: string; width?: string; height?: string }) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        width,
        height,
        background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-card">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <Skeleton className="h-8 w-64" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

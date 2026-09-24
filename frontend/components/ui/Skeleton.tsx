import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-cx-border-subtle", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card w-full h-full p-6 animate-pulse border-transparent bg-cx-surface">
      <div className="flex items-start justify-between">
        <div className="space-y-3 w-full">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-1/2 mt-2" />
          <div className="pt-4 space-y-2">
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
        <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0 ml-4" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-cx-border-subtle">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-8 space-y-3 animate-pulse">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-1/2 max-w-[400px]" />
    </div>
  );
}

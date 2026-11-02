import { Loader2, BookOpen, AlertTriangle } from 'lucide-react';
import { GoldRule } from './Card';

export const Spinner = ({ className = 'h-5 w-5 text-accent' }) => (
  <Loader2 className={`animate-spin ${className}`} />
);

export const LoadingState = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted">
    <div className="relative">
      <span className="absolute inset-0 animate-ping rounded-full bg-accent-soft" />
      <Loader2 className="relative h-8 w-8 animate-spin text-accent" />
    </div>
    <p className="text-sm">{label}</p>
  </div>
);

export const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <LoadingState label="Opening the library..." />
  </div>
);

export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton rounded-lg ${className}`} />
);

export const SkeletonCard = () => (
  <div className="rounded-[20px] border border-line/70 bg-white p-5 shadow-soft">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="mt-4 h-8 w-20" />
    <Skeleton className="mt-3 h-3 w-32" />
  </div>
);

export const SkeletonRows = ({ rows = 5 }) => (
  <div className="divide-y divide-line/70">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-5 py-4">
        <Skeleton className="h-11 w-9 shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-surface text-navy/50">
      <BookOpen className="h-7 w-7" />
      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-gold" />
    </div>
    <div>
      <h3 className="font-display text-base font-semibold text-navy">{title}</h3>
      <div className="mt-2 flex justify-center">
        <GoldRule className="w-6" />
      </div>
    </div>
    {description && <p className="max-w-sm text-sm leading-relaxed text-muted">{description}</p>}
    {action && <div className="mt-1">{action}</div>}
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
      <AlertTriangle className="h-6 w-6" />
    </div>
    <div>
      <h3 className="font-display text-base font-semibold text-navy">Something went wrong</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">{message || 'Please try again in a moment.'}</p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-1 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-navy transition hover:bg-surface"
      >
        Try again
      </button>
    )}
  </div>
);

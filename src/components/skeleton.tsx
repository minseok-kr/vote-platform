"use client";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-[var(--bg-active)] ${className}`}
    />
  );
}

export function PollCardSkeleton() {
  return (
    <div className="p-8 bg-[var(--bg-card)] border border-[var(--border-primary)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Question */}
      <Skeleton className="h-8 w-3/4 mb-6" />

      {/* Options */}
      <div className="space-y-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border-primary)]">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-28" />
      </div>
    </div>
  );
}

export function TrendingPollsSkeleton() {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 border border-[var(--border-primary)]"
          >
            <Skeleton className="h-10 w-full mb-4" />
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AllPollsSkeleton() {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="h-8 w-28" />
        <div className="flex gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="border border-[var(--border-primary)]">
        <div className="hidden md:flex items-center px-5 py-3.5 bg-[var(--bg-card)]">
          <Skeleton className="h-3 w-20" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center px-5 py-4 border-t border-[var(--border-primary)]"
          >
            <Skeleton className="h-4 flex-1 mr-8" />
            <Skeleton className="h-4 w-16 mr-8" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function PollDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-16" />
      </div>

      <div className="p-8 bg-[var(--bg-card)] border border-[var(--border-primary)]">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>

        <Skeleton className="h-10 w-3/4 mb-3" />
        <Skeleton className="h-4 w-1/2 mb-6" />

        <div className="space-y-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-primary)]">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-12 w-28" />
        </div>
      </div>
    </div>
  );
}

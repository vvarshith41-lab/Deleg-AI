import React from 'react';

/**
 * Reusable LoadingSkeleton components with smooth pulse animations
 * for cards, metrics, lists, and content blocks.
 */

export function MetricSkeleton() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
      <div className="h-3 w-24 bg-slate-200 rounded mb-3" />
      <div className="h-8 w-16 bg-slate-300 rounded mb-2" />
      <div className="h-3 w-32 bg-slate-200 rounded" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-4 w-20 bg-slate-200 rounded" />
        <div className="h-4 w-16 bg-slate-200 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-5 w-3/4 bg-slate-300 rounded" />
        <div className="h-3.5 w-full bg-slate-200 rounded" />
        <div className="h-3.5 w-5/6 bg-slate-200 rounded" />
      </div>
      <div className="flex gap-1.5 pt-2">
        <div className="h-5 w-16 bg-slate-200 rounded-md" />
        <div className="h-5 w-20 bg-slate-200 rounded-md" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
        <div className="h-3.5 w-24 bg-slate-200 rounded" />
        <div className="h-7 w-28 bg-slate-200 rounded-lg" />
      </div>
    </div>
  );
}

export function EmployeeCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 bg-slate-300 rounded" />
          <div className="h-3 w-16 bg-slate-200 rounded-full" />
        </div>
        <div className="text-right space-y-1">
          <div className="h-3 w-14 bg-slate-200 rounded" />
          <div className="h-5 w-10 bg-slate-300 rounded ml-auto" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 w-24 bg-slate-200 rounded" />
        <div className="h-2 w-full bg-slate-200 rounded-full" />
        <div className="h-2 w-full bg-slate-200 rounded-full" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm divide-y divide-slate-100 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
          <div className="space-y-1.5 flex-1 pr-4">
            <div className="h-4 w-40 bg-slate-300 rounded" />
            <div className="h-3 w-64 bg-slate-200 rounded" />
          </div>
          <div className="h-7 w-20 bg-slate-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function LoadingSkeleton({ type = 'card', count = 1 }) {
  const Skeletons = {
    metric: MetricSkeleton,
    card: CardSkeleton,
    employee: EmployeeCardSkeleton,
    list: ListSkeleton
  };

  const Component = Skeletons[type] || CardSkeleton;

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <Component key={idx} />
      ))}
    </>
  );
}

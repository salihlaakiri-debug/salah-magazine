"use client";

export default function WorkLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-24 bg-surface rounded-full" />
        <div className="h-10 w-3/4 bg-surface rounded-xl" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-surface" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-surface rounded-full" />
            <div className="h-3 w-20 bg-surface rounded-full" />
          </div>
        </div>
        <div className="space-y-3 mt-8">
          <div className="h-4 w-full bg-surface rounded-full" />
          <div className="h-4 w-5/6 bg-surface rounded-full" />
          <div className="h-4 w-4/6 bg-surface rounded-full" />
          <div className="h-4 w-full bg-surface rounded-full" />
          <div className="h-4 w-3/4 bg-surface rounded-full" />
        </div>
      </div>
    </div>
  );
}

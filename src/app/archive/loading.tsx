"use client";

export default function ArchiveLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="h-8 w-40 bg-surface rounded-xl mb-8" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-surface rounded-2xl p-5 space-y-3 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="h-5 w-14 bg-background rounded-full" />
              <div className="h-3 w-20 bg-background rounded-full" />
            </div>
            <div className="h-5 w-3/4 bg-background rounded-full" />
            <div className="h-4 w-full bg-background rounded-full" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-background" />
              <div className="h-3 w-20 bg-background rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

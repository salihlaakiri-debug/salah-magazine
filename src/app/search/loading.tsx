"use client";

export default function SearchLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="h-8 w-48 bg-surface rounded-xl mb-6" />
      <div className="h-14 w-full bg-surface rounded-2xl mb-6" />
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-20 bg-surface rounded-xl" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-16 bg-background rounded-full" />
              <div className="h-3 w-24 bg-background rounded-full" />
            </div>
            <div className="h-5 w-2/3 bg-background rounded-full" />
            <div className="h-4 w-full bg-background rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

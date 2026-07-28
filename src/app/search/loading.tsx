export default function SearchLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
      <div className="h-4 w-32 bg-surface-hover rounded mb-8" />
      <div className="h-12 w-full bg-surface-hover rounded-2xl mb-8" />
      <div className="h-5 w-40 bg-surface-hover rounded mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-surface border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-16 bg-accent/10 rounded-full" />
              <div className="h-4 w-20 bg-surface-hover rounded" />
            </div>
            <div className="h-6 w-2/3 bg-surface-hover rounded mb-2" />
            <div className="h-4 w-full bg-surface-hover rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

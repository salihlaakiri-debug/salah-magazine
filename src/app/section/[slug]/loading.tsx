export default function SectionLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="h-4 w-32 bg-surface-hover rounded mb-10" />
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-10 rounded-full bg-accent/20" />
        <div className="w-12 h-12 rounded-xl bg-accent/10" />
      </div>
      <div className="h-10 w-48 bg-surface-hover rounded mb-3" />
      <div className="h-5 w-72 bg-surface-hover rounded mb-12" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-surface border border-border/50 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-16 bg-accent/10 rounded-full" />
              <div className="h-4 w-20 bg-surface-hover rounded" />
            </div>
            <div className="h-6 w-3/4 bg-surface-hover rounded mb-2" />
            <div className="h-4 w-full bg-surface-hover rounded mb-4" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-accent/10" />
              <div className="h-3 w-20 bg-surface-hover rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

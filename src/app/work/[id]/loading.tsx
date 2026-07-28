export default function WorkLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
      <div className="max-w-3xl mx-auto lg:ml-auto lg:mr-0">
        <div className="h-4 w-48 bg-surface-hover rounded mb-8" />
        <div className="flex items-center gap-3 mb-6">
          <div className="h-6 w-20 bg-accent/10 rounded-full" />
          <div className="h-4 w-24 bg-surface-hover rounded" />
        </div>
        <div className="h-10 w-3/4 bg-surface-hover rounded mb-4" />
        <div className="h-10 w-1/2 bg-surface-hover rounded mb-6" />
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border/30">
          <div className="w-10 h-10 rounded-full bg-accent/10" />
          <div>
            <div className="h-4 w-24 bg-surface-hover rounded mb-1" />
            <div className="h-3 w-32 bg-surface-hover rounded" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-full bg-surface-hover rounded" />
          <div className="h-4 w-5/6 bg-surface-hover rounded" />
          <div className="h-4 w-4/5 bg-surface-hover rounded" />
          <div className="h-4 w-full bg-surface-hover rounded" />
          <div className="h-4 w-3/4 bg-surface-hover rounded" />
          <div className="h-4 w-5/6 bg-surface-hover rounded" />
        </div>
      </div>
    </div>
  );
}

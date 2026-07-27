export default function OrnamentalDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 py-2 ${className}`}>
      <svg width="80" height="12" viewBox="0 0 80 12" fill="none" className="text-accent/30">
        <line x1="0" y1="6" x2="30" y2="6" stroke="currentColor" strokeWidth="0.75" />
        <path d="M34 6L38 2L42 6L38 10Z" stroke="currentColor" strokeWidth="0.75" fill="none" />
        <circle cx="42" cy="6" r="1.5" fill="currentColor" />
        <path d="M46 6L50 2L54 6L50 10Z" stroke="currentColor" strokeWidth="0.75" fill="none" />
        <line x1="58" y1="6" x2="80" y2="6" stroke="currentColor" strokeWidth="0.75" />
      </svg>
    </div>
  );
}

export function OrnamentalDividerFull({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-4 ${className}`}>
      <svg width="200" height="16" viewBox="0 0 200 16" fill="none" className="text-accent/25">
        <line x1="0" y1="8" x2="60" y2="8" stroke="currentColor" strokeWidth="0.5" />
        <path d="M64 8L68 3L72 8L68 13Z" stroke="currentColor" strokeWidth="0.75" fill="none" />
        <circle cx="80" cy="8" r="1" fill="currentColor" />
        <path d="M86 2L90 8L86 14" stroke="currentColor" strokeWidth="0.75" fill="none" />
        <path d="M94 8L98 3L102 8L98 13Z" stroke="currentColor" strokeWidth="0.75" fill="currentColor" fillOpacity="0.15" />
        <path d="M108 14L112 8L108 2" stroke="currentColor" strokeWidth="0.75" fill="none" />
        <circle cx="120" cy="8" r="1" fill="currentColor" />
        <path d="M126 8L130 3L134 8L130 13Z" stroke="currentColor" strokeWidth="0.75" fill="none" />
        <line x1="140" y1="8" x2="200" y2="8" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

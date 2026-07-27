export function RootIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12" />
      <path d="M12 12C12 12 8 8 5 9C2 10 3 14 6 14C7.5 14 9 13 12 12Z" />
      <path d="M12 12C12 12 16 8 19 9C22 10 21 14 18 14C16.5 14 15 13 12 12Z" />
      <path d="M12 16C12 16 10 14 8 15C6 16 7 18 9 18C10.2 18 11 17.5 12 16Z" />
      <path d="M12 16C12 16 14 14 16 15C18 16 17 18 15 18C13.8 18 13 17.5 12 16Z" />
      <circle cx="12" cy="6" r="2" />
    </svg>
  );
}

export function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5z" />
      <path d="M18 14l.75 2.25L21 17l-2.25.75L18 20l-.75-2.25L15 17l2.25-.75z" />
      <path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5z" />
    </svg>
  );
}

export function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
      <path d="M12 2L9.19 8.63" />
      <path d="M12 2L14.81 8.63" />
      <path d="M12 2V5" />
    </svg>
  );
}

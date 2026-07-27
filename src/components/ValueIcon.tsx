export function RootIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <path d="M12 22V12" strokeLinecap="round" />
      <path d="M12 12C12 12 8 8 5 9C2 10 3 14 6 14C7.5 14 9 13 12 12Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12C12 12 16 8 19 9C22 10 21 14 18 14C16.5 14 15 13 12 12Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16C12 16 10 14 8 15C6 16 7 18 9 18C10.2 18 11 17.5 12 16Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16C12 16 14 14 16 15C18 16 17 18 15 18C13.8 18 13 17.5 12 16Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="6" r="2" />
    </svg>
  );
}

export function FeatherIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 8L2 22" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.5 15H9" strokeLinecap="round" />
    </svg>
  );
}

export function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <path d="M9 18h6" strokeLinecap="round" />
      <path d="M10 22h4" strokeLinecap="round" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2L9.19 8.63" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2L14.81 8.63" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2V5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

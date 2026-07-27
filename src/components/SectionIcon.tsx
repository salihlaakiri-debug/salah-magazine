import { Section } from "@/lib/types";

function PoetryIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.5 0 3-.3 4.3-.9" />
      <path d="M17 8l-1.5 4.5L11 14l4.5 1.5L17 20l1.5-4.5L23 14l-4.5-1.5z" />
      <path d="M2 12h4" />
      <path d="M12 2v4" />
    </svg>
  );
}

function StoryIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      <path d="M6 8h2" />
      <path d="M16 8h2" />
      <path d="M6 12h2" />
      <path d="M16 12h2" />
    </svg>
  );
}

function ProseIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function ArticlesIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
      <path d="M9 11h2" />
      <path d="M9 15h6" />
    </svg>
  );
}

function ReflectionsIcon({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      <circle cx="17" cy="5" r="0.5" fill="currentColor" />
      <circle cx="19" cy="9" r="0.5" fill="currentColor" />
    </svg>
  );
}

const SECTION_ICONS: Record<Section, React.ComponentType<{ size: number; className: string }>> = {
  "شعر": PoetryIcon,
  "قصة": StoryIcon,
  "نثر": ProseIcon,
  "مقالات": ArticlesIcon,
  "تأملات": ReflectionsIcon,
};

export default function SectionIcon({ section, size = 24, className = "" }: { section: Section; size?: number; className?: string }) {
  const Icon = SECTION_ICONS[section];
  if (!Icon) return null;
  return <Icon size={size} className={className} />;
}

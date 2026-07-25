import SudfehIcon from "./SudfehIcon";

type Props = {
  size?: number;
  className?: string;
  showText?: boolean;
};

export default function SudfehLogo({ size = 40, className = "", showText = true }: Props) {
  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      style={{ height: size }}
      role="img"
      aria-label="السُّدفة"
    >
      <SudfehIcon size={size} />
      {showText && (
        <span
          className="font-bold font-[var(--font-heading)] gradient-text leading-none whitespace-nowrap"
          style={{ fontSize: Math.round(size * 0.42) }}
        >
          السُّدفة
        </span>
      )}
    </div>
  );
}

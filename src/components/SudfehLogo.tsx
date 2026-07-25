type Props = {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
};

export default function SudfehLogo({ size = 40, className = "", showText = false, textClassName = "" }: Props) {
  const h = size;
  const w = showText ? size * 3.5 : size;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 140 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="السُّدفة"
    >
      {/* Icon mark: pen nib + crescent glow */}
      <g>
        {/* Outer circle — accent color */}
        <circle cx="20" cy="20" r="18" fill="var(--accent)" opacity="0.12" />
        <circle cx="20" cy="20" r="18" stroke="var(--accent)" strokeWidth="1.5" opacity="0.3" />

        {/* Crescent glow behind pen */}
        <path
          d="M20 6 C28 6 34 12 34 20 C34 28 28 34 20 34 C24 34 26 30 26 24 C26 16 24 10 20 6Z"
          fill="var(--accent)"
          opacity="0.2"
        />

        {/* Pen nib */}
        <path
          d="M20 7 L25 19 L22.5 28 L20 33 L17.5 28 L15 19 Z"
          fill="var(--accent)"
          opacity="0.85"
        />
        <path
          d="M20 7 L20 33"
          stroke="var(--background)"
          strokeWidth="0.8"
          opacity="0.4"
        />
        <path
          d="M17 16 L23 16"
          stroke="var(--background)"
          strokeWidth="0.6"
          opacity="0.3"
        />

        {/* Pen tip highlight */}
        <circle cx="20" cy="33" r="1.2" fill="var(--accent)" />
      </g>

      {/* Text mark: السُّدفة */}
      {showText && (
        <text
          x="44"
          y="26"
          fill="var(--foreground)"
          fontFamily="'Noto Kufi Arabic', sans-serif"
          fontWeight="700"
          fontSize="18"
          dominantBaseline="middle"
          className={textClassName}
        >
          السُّدفة
        </text>
      )}
    </svg>
  );
}

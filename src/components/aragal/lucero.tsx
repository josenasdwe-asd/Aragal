import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: number;
};

/**
 * Lucero — a small five-pointed guiding star, the spiritual motif of ARAGAL.
 * Used next to spiritual/timeline titles and as a recurring brand mark.
 */
export function Lucero({ className, size = 16 }: Props) {
  return (
    <svg
      className={cn("inline-block", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="lucero-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fcfaf0" />
          <stop offset="50%" stopColor="var(--gold)" />
          <stop offset="100%" stopColor="var(--gold-soft)" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.5 L14.2 9 L21.8 9.3 L15.7 13.8 L17.8 21.3 L12 16.8 L6.2 21.3 L8.3 13.8 L2.2 9.3 L9.8 9 Z"
        fill="url(#lucero-grad)"
        stroke="var(--gold-soft)"
        strokeWidth="0.3"
      />
      <circle cx="12" cy="11.5" r="1.4" fill="#fcfaf0" opacity="0.7" />
    </svg>
  );
}

/**
 * WaxSeal — a circular wax seal with "ARAGAL" lettering, used as a
 * watermark on the bio section. Evokes authenticity and old documents.
 */
export function WaxSeal({ className, size = 120 }: Props) {
  return (
    <svg
      className={cn("pointer-events-none select-none", className)}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="seal-grad" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.9" />
          <stop offset="60%" stopColor="var(--gold-soft)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--terracota-soft)" stopOpacity="0.5" />
        </radialGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="60" cy="60" r="56" fill="none" stroke="url(#seal-grad)" strokeWidth="1.5" opacity="0.5" />
      {/* Inner ring */}
      <circle cx="60" cy="60" r="48" fill="none" stroke="url(#seal-grad)" strokeWidth="0.8" opacity="0.4" />
      {/* Text on a circle path */}
      <defs>
        <path id="seal-text-path" d="M 60,60 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0" />
      </defs>
      <text
        fontFamily="var(--font-display), serif"
        fontSize="9"
        fontWeight="600"
        letterSpacing="4"
        fill="url(#seal-grad)"
        opacity="0.6"
      >
        <textPath href="#seal-text-path" startOffset="25%">
          · ARAGAL · MARIO ARAVENA ·
        </textPath>
      </text>
      {/* Center lucero */}
      <g transform="translate(60 60) scale(0.9)">
        <path
          d="M0 -16 L4.5 -5 L16 -5 L6.7 3 L10 14 L0 7 L-10 14 L-6.7 3 L-16 -5 L-4.5 -5 Z"
          fill="url(#seal-grad)"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}

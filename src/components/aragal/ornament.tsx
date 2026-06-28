import { cn } from "@/lib/utils";
import { Lucero } from "./lucero";

/**
 * SectionDivider — an elegant centered divider with a lucero (guiding star)
 * flanked by tapering gold filigree lines. Used between major sections.
 */
export function SectionDivider({
  className,
  variant = "lucero",
}: {
  className?: string;
  variant?: "lucero" | "staff" | "diamond";
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4 py-3",
        className
      )}
      aria-hidden="true"
    >
      <Filigree className="w-24 sm:w-32" flip />
      <CenterMotif variant={variant} />
      <Filigree className="w-24 sm:w-32" />
    </div>
  );
}

/** Tapering filigree line — a thin gold rule that fades to a point. */
function Filigree({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      className={cn("h-[2px] text-[var(--gold)]", flip && "-scale-x-100", className)}
      viewBox="0 0 120 2"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <linearGradient id="filig-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--gold)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="1" />
        </linearGradient>
      </defs>
      <line x1="0" y1="1" x2="120" y2="1" stroke="url(#filig-grad)" strokeWidth="1" />
      <circle cx="118" cy="1" r="1.4" fill="var(--gold)" />
    </svg>
  );
}

function CenterMotif({ variant }: { variant: "lucero" | "staff" | "diamond" }) {
  if (variant === "staff") {
    // Musical staff divider: two thin gold lines (like a staff) with a gap
    return (
      <svg className="h-5 w-6 text-[var(--gold)]" viewBox="0 0 24 20" fill="none">
        <line x1="2" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
        <line x1="2" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
        <line x1="4" y1="2" x2="4" y2="18" stroke="currentColor" strokeWidth="1.2" />
        <line x1="20" y1="2" x2="20" y2="18" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }
  if (variant === "diamond") {
    return (
      <svg className="h-3 w-3 text-[var(--gold)]" viewBox="0 0 12 12" fill="none">
        <path d="M6 0 L12 6 L6 12 L0 6 Z" fill="var(--gold)" opacity="0.9" />
        <path d="M6 2 L10 6 L6 10 L2 6 Z" fill="none" stroke="#fcfaf0" strokeWidth="0.5" opacity="0.5" />
      </svg>
    );
  }
  // Default: lucero (guiding star)
  return <Lucero size={18} />;
}

/** Small ornamental flourish used to flank section titles. */
export function TitleFlourish({
  className,
  flip = false,
}: {
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      className={cn(
        "h-2.5 w-8 text-[var(--gold)] opacity-70",
        flip && "-scale-x-100",
        className
      )}
      viewBox="0 0 40 8"
      fill="none"
    >
      <path
        d="M0 4 Q10 4 16 4 Q22 4 28 2 Q34 0 40 4"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="16" cy="4" r="1" fill="currentColor" />
    </svg>
  );
}

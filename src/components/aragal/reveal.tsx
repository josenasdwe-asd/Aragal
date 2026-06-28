"use client";

import { type ReactNode } from "react";

type Direction = "up" | "left" | "right" | "scale" | "none";

type Props = {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
};

/**
 * Reveal wrapper — currently a passthrough (no animation).
 *
 * The previous framer-motion + IntersectionObserver implementation caused
 * visible flicker: elements rendered at opacity:0, then jumped to opacity:1
 * when inView fired, creating a flash on load and on scroll. To eliminate
 * the flicker completely, this component now renders children directly with
 * no transform/opacity animation.
 *
 * The props are kept for API compatibility so existing call sites don't need
 * to change. If you want to re-introduce scroll animations later, use CSS
 * @keyframes with prefers-reduced-motion guards instead of JS-driven opacity.
 */
export function Reveal({ children, className }: Props) {
  return <div className={className}>{children}</div>;
}

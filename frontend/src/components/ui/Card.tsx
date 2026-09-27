import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds hover lift + glow — for interactive cards only. */
  hover?: boolean;
}

export function Card({ children, className = "", hover = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-navy-100 bg-white shadow-card ${hover ? "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift hover:glow-soft" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

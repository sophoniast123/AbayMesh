/**
 * AbayMesh logo mark — stylized "A" with a blue→green river flow,
 * inspired by the brand reference.
 */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="abaymesh-a" x1="6" y1="34" x2="34" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2489ce" />
          <stop offset="0.55" stopColor="#17a891" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#abaymesh-a)" />
      <path
        d="M11 28 20 12l9 16"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 22.5h11"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface LogoProps {
  /** Hide the wordmark, e.g. on small screens. */
  markOnly?: boolean;
  className?: string;
}

export function Logo({ markOnly = false, className = "" }: LogoProps) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-9 w-9 shrink-0" />
      {!markOnly && (
        <span className="text-lg font-bold tracking-tight text-navy-900">
          Abay<span className="text-aqua-500">Mesh</span>
        </span>
      )}
    </span>
  );
}

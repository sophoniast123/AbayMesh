import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-gradient text-white shadow-[0_4px_14px_-4px_rgb(21_112_181/0.5)] hover:shadow-[0_6px_20px_-4px_rgb(21_112_181/0.55)] hover:brightness-110 active:scale-[0.98]",
  secondary:
    "border border-navy-200 bg-white text-navy-700 shadow-sm hover:border-brand-300 hover:text-brand-700 active:scale-[0.98]",
  ghost:
    "text-navy-600 hover:bg-navy-50 hover:text-navy-900 active:scale-[0.98]",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

type ButtonStyleProps = { variant?: Variant; size?: Size };

function classes({ variant = "primary", size = "md" }: ButtonStyleProps) {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleProps;

export function Button({ variant, size, className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`${classes({ variant, size })} ${className}`} {...props} />;
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonStyleProps & { href: string; children: ReactNode };

export function ButtonLink({ href, variant, size, className = "", children, ...props }: ButtonLinkProps) {
  return (
    <Link href={href} className={`${classes({ variant, size })} ${className}`} {...props}>
      {children}
    </Link>
  );
}

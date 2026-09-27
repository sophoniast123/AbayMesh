"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/brand/Logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/organizations", label: "Organizations" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-navy-100 bg-white md:sticky md:top-0 md:h-dvh md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center gap-3 px-4 py-4 md:px-5">
        <Link href="/" aria-label="AbayMesh home" className="flex items-center gap-2.5 rounded-lg">
          <Logo />
        </Link>
      </div>

      <nav
        aria-label="Main navigation"
        className="flex flex-row gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3"
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
              }`}
            >
              {item.label}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand-gradient md:block"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden px-5 pb-6 md:block">
        <div className="rounded-xl border border-navy-100 bg-gradient-to-br from-brand-50 via-white to-aqua-50 p-4">
          <p className="text-xs font-semibold text-navy-800">AI suggests. Humans approve.</p>
          <p className="mt-1 text-[11px] leading-relaxed text-navy-500">
            Schema mapping with human-in-the-loop review.
          </p>
        </div>
      </div>
    </aside>
  );
}

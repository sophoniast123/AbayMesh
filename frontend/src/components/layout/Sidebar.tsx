"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/organizations", label: "Organizations" },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-zinc-200 bg-white md:min-h-dvh md:w-60 md:border-b-0 md:border-r dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2.5 px-4 py-4 md:px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
          SC
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Data Fabric
          </p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
            Supply Chain
          </p>
        </div>
      </div>

      <nav
        aria-label="Main navigation"
        className="flex flex-row gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-3"
      >
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

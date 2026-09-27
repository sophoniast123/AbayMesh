import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="glass sticky top-0 z-40">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" aria-label="AbayMesh home">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ButtonLink href="/organizations" variant="ghost" size="sm" className="hidden sm:inline-flex">
              Console
            </ButtonLink>
            <ButtonLink href="/organizations" size="sm">
              Explore Platform
            </ButtonLink>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-navy-100 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-navy-400 sm:flex-row md:px-6">
          <Logo />
          <p>AI-Powered Supply Chain Data Interoperability</p>
        </div>
      </footer>
    </div>
  );
}

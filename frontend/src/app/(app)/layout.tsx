import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Sidebar />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}

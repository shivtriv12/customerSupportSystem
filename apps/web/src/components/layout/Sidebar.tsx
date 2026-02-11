import type { ReactNode } from "react";

export function Sidebar({ children }: { children: ReactNode }) {
  return <div className="flex h-full flex-col">{children}</div>;
}
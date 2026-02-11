import type { ReactNode } from "react";

export function AppShell({ sidebar, content }: { sidebar: ReactNode; content: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto flex h-screen max-w-7xl">
        <aside className="w-72 border-r border-neutral-200 bg-white">
          {sidebar}
        </aside>
        <main className="flex-1">{content}</main>
      </div>
    </div>
  );
}
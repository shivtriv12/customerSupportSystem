import type { Agent } from "../../types/ui";

export function AgentList({ agents }: { agents: Agent[] }) {
  return (
    <div className="border-b border-neutral-200 p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Agents
      </h2>
      <div className="space-y-2">
        {agents.map((a) => (
          <div key={a.type} className="rounded-lg border border-neutral-200 bg-white px-3 py-2">
            <div className="text-sm font-medium">{a.name}</div>
            <div className="text-xs text-neutral-500">{a.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
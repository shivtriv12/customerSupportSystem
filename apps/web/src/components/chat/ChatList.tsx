import type { ConversationListItem } from "../../types/ui";
import { formatTime } from "../../lib/format";

export function ChatList({
  conversations,
  activeId,
  onSelect,
}: {
  conversations: ConversationListItem[];
  activeId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Conversations
      </h2>

      {conversations.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-4 text-center text-sm text-neutral-500">
          No conversations yet.
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                activeId === c.id
                  ? "border-neutral-900 bg-neutral-100"
                  : "border-neutral-200 bg-white hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{c.title}</div>
                <div className="text-xs text-neutral-400">{formatTime(c.updatedAt)}</div>
              </div>
              <div className="mt-1 truncate text-xs text-neutral-500">{c.lastMessage}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
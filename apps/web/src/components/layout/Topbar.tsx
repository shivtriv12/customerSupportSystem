import type { User } from "../../types/ui";

export function Topbar({
  selectedUser,
  loadingUser,
}: {
  selectedUser?: User;
  loadingUser?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold">Customer Support</h1>
      </div>

      <div className="text-right">
        {loadingUser ? (
          <div className="text-sm text-neutral-400">Loading user...</div>
        ) : selectedUser ? (
          <div>
            <div className="text-sm font-medium">{selectedUser.name}</div>
            <div className="text-xs text-neutral-500">{selectedUser.email}</div>
          </div>
        ) : (
          <div className="text-sm text-neutral-400">No user selected</div>
        )}
      </div>
    </div>
  );
}
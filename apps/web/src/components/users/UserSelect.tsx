import type { User } from "../../types/ui";

export function UserSelect({
  users,
  selectedUserId,
  onChange,
  loading,
}: {
  users: User[];
  selectedUserId?: string;
  onChange: (id: string) => void;
  loading?: boolean;
}) {
  return (
    <div className="border-b border-neutral-200 p-4">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Select User
      </label>
      <select
        value={selectedUserId ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-60"
      >
        <option value="" disabled>
          {loading ? "Loading users..." : "Choose a user"}
        </option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} — {u.email}
          </option>
        ))}
      </select>
    </div>
  );
}
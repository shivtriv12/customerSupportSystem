export function AIStatusIndicator({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-neutral-500">
      <div className="h-2 w-2 animate-pulse rounded-full bg-neutral-400" />
      <span>{text}</span>
    </div>
  );
}
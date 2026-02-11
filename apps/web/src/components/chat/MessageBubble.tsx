import type { Message } from "../../types/ui";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "USER";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
          isUser
            ? "bg-neutral-900 text-white"
            : "bg-white text-neutral-900 border border-neutral-200"
        }`}
      >
        <div>{message.content}</div>
      </div>
    </div>
  );
}
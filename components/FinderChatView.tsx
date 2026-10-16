import type { Message, PublicTag } from "@/lib/types";
import { FinderReplyForm } from "./forms/FinderReplyForm";
import { MessageThread } from "./MessageThread";
import { StatusBadge } from "./StatusBadge";
import { card } from "./ui";

export function FinderChatView({ token, tag, messages }: { token: string; tag: PublicTag; messages: Message[] }) {
  return (
    <div className={`${card} mx-auto mt-6 max-w-xl`}>
      <div className="mb-1 flex items-center gap-2">
        <h1 className="text-xl font-bold">Chat about: {tag.itemName}</h1>
        <StatusBadge status={tag.status} />
      </div>
      <p className="mb-4 text-xs text-muted">Private link. Keep it safe; anyone with this link can read this chat. The owner cannot see who you are.</p>
      <MessageThread messages={messages} viewer="finder" />
      <FinderReplyForm token={token} />
    </div>
  );
}

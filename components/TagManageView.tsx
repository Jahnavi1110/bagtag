import Link from "next/link";
import { tagUrl } from "@/lib/templates";
import type { Conversation, Tag } from "@/lib/types";
import { DeleteTagForm } from "./forms/DeleteTagForm";
import { OwnerReplyForm } from "./forms/OwnerReplyForm";
import { StatusForm } from "./forms/StatusForm";
import { MessageThread } from "./MessageThread";
import { StatusBadge } from "./StatusBadge";
import { TagExportPanel } from "./TagExportPanel";
import { btnSecondary, card } from "./ui";

export function TagManageView({ tag, conversations, siteUrl }: { tag: Tag; conversations: Conversation[]; siteUrl: string }) {
  const publicUrl = tagUrl(siteUrl, tag.code);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4">
        <div className={`${card} space-y-3`}>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{tag.itemName}</h1>
            <StatusBadge status={tag.status} />
          </div>
          <p className="text-sm text-gray-600">
            Public page: <Link href={`/t/${tag.code}`} className="break-all text-blue-700 underline">{publicUrl}</Link> · {tag.scanCount} scans
          </p>
          {tag.note && <p className="text-sm text-gray-700">Note: {tag.note}</p>}
          <StatusForm tagId={tag.id} status={tag.status} />
        </div>
        <div className={card}>
          <h2 className="mb-3 font-semibold">Tag & export</h2>
          <TagExportPanel tag={tag} siteUrl={siteUrl} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/tags/${tag.id}/edit`} className={btnSecondary}>Edit tag</Link>
          <DeleteTagForm tagId={tag.id} />
        </div>
      </section>

      <section className={`${card} space-y-4`}>
        <h2 className="font-semibold">Messages from finders</h2>
        {conversations.length === 0 && <p className="text-sm text-gray-500">No messages yet. When someone scans your tag and writes to you, it shows up here.</p>}
        {conversations.map((c, i) => (
          <div key={c.id} className="rounded-md border border-gray-200 p-3" data-testid="conversation">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Finder #{conversations.length - i} {c.unread > 0 && <span className="text-blue-700">· {c.unread} new</span>}
            </div>
            <MessageThread messages={c.messages} viewer="owner" />
            <OwnerReplyForm conversationId={c.id} />
          </div>
        ))}
      </section>
    </div>
  );
}

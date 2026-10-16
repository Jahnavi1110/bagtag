import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";
import type { TagSummary } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { btnPrimary, btnSecondary, card } from "./ui";

export function DashboardView({ tags }: { tags: TagSummary[] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Your tags</h1>
        <div className="flex gap-2">
          <Link href="/tags/print" className={btnSecondary}>Print sheet</Link>
          <Link href="/tags/new" className={btnPrimary}>+ New tag</Link>
        </div>
      </div>

      {tags.length === 0 ? (
        <div className={`${card} text-center text-gray-600`}>No tags yet. Make your first one!</div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2" data-testid="tag-list">
          {tags.map((t) => (
            <li key={t.id} className={`${card} flex items-center justify-between gap-3`}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">{t.itemName}</span>
                  <StatusBadge status={t.status} />
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {TEMPLATES[t.design.template].label} · <span className="font-mono">{t.code}</span>
                </div>
                <div className="mt-1 flex gap-3 text-sm text-gray-600">
                  <span>{t.scanCount} scans</span>
                  <span>{t.conversationCount} conversations</span>
                  {t.unreadCount > 0 && <span className="font-semibold text-blue-700">{t.unreadCount} unread</span>}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link href={`/tags/${t.id}/edit`} className={btnSecondary}>Edit</Link>
                <Link href={`/tags/${t.id}`} className={btnPrimary}>Open</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* eslint-disable @next/next/no-img-element -- user photo served from our own route */
import { photoUrl } from "@/lib/db/mappers";
import type { PublicTag } from "@/lib/types";
import { FinderPanel } from "./FinderPanel";
import { StatusBadge } from "./StatusBadge";
import { card } from "./ui";

/** What a finder sees after scanning. Deliberately limited to PublicTag fields only. */
export function PublicTagView({ tag }: { tag: PublicTag }) {
  const photo = photoUrl(tag.photoPath);
  return (
    <div className="mx-auto max-w-3xl space-y-4 py-4">
      {tag.status === "lost" && (
        <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-red-900" role="alert" data-testid="lost-banner">
          <div className="font-display text-lg font-black">⚠ This item has been reported LOST</div>
          <p className="text-sm">The owner is actively looking for it. Please send them a message below.</p>
        </div>
      )}
      <div className={`${card} space-y-3`}>
        <p className="text-sm text-muted">This item belongs to someone. Help return it!</p>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl">{tag.itemName}</h1>
          <StatusBadge status={tag.status} />
        </div>
        {photo && <img src={photo} alt={tag.itemName} className="max-h-64 rounded-xl object-cover" />}
        {tag.note && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{tag.note}</p>}
      </div>
      <FinderPanel code={tag.code} status={tag.status} />
    </div>
  );
}

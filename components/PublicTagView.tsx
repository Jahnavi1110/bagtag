/* eslint-disable @next/next/no-img-element -- user photo served from our own route */
import { photoUrl } from "@/lib/db/mappers";
import type { PublicTag } from "@/lib/types";
import { FinderMessageForm } from "./forms/FinderMessageForm";
import { StatusBadge } from "./StatusBadge";
import { card } from "./ui";

/** What a finder sees after scanning. Deliberately limited to PublicTag fields only. */
export function PublicTagView({ tag }: { tag: PublicTag }) {
  const photo = photoUrl(tag.photoPath);
  return (
    <div className="mx-auto max-w-xl space-y-4 py-6">
      {tag.status === "lost" && (
        <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4 text-red-900" role="alert" data-testid="lost-banner">
          <div className="text-lg font-bold">⚠ This item has been reported LOST</div>
          <p className="text-sm">The owner is actively looking for it. Please send them a message below.</p>
        </div>
      )}
      <div className={`${card} space-y-3`}>
        <p className="text-sm font-medium text-blue-700">This item belongs to someone. Help return it!</p>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{tag.itemName}</h1>
          <StatusBadge status={tag.status} />
        </div>
        {photo && <img src={photo} alt={tag.itemName} className="max-h-64 rounded-md object-cover" />}
        {tag.note && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">{tag.note}</p>}
      </div>
      <div className={card}>
        <FinderMessageForm code={tag.code} />
      </div>
    </div>
  );
}

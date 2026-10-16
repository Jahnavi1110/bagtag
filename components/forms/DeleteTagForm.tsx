"use client";

import { useState } from "react";
import { removeTag } from "@/lib/actions/tags";
import { btnDanger, btnSecondary } from "../ui";

/** Two-step delete: the first click asks for confirmation inline. */
export function DeleteTagForm({ tagId }: { tagId: string }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return <button type="button" className={btnDanger} onClick={() => setConfirming(true)}>Delete tag</button>;
  }
  return (
    <form action={removeTag} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="tagId" value={tagId} />
      <span className="text-sm text-red-700">Delete this tag and all its messages?</span>
      <button className={btnDanger}>Yes, delete</button>
      <button type="button" className={btnSecondary} onClick={() => setConfirming(false)}>Cancel</button>
    </form>
  );
}

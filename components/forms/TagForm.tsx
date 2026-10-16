"use client";

import { useActionState, useState } from "react";
import { saveTag } from "@/lib/actions/tags";
import { COLORS, DEFAULT_DESIGN, TEMPLATE_IDS, TEMPLATES } from "@/lib/templates";
import type { Tag, TagDesign } from "@/lib/types";
import { TagPreview } from "../TagPreview";
import { btnPrimary, card, input, label } from "../ui";

/** Tag maker: form on the left, live real-scale preview on the right. Used for both create and edit. */
export function TagForm({ tag, siteUrl }: { tag?: Tag; siteUrl: string }) {
  const [state, action, pending] = useActionState(saveTag, undefined);
  const [itemName, setItemName] = useState(tag?.itemName ?? "");
  const [design, setDesign] = useState<TagDesign>(tag?.design ?? DEFAULT_DESIGN);
  const update = (patch: Partial<TagDesign>) => setDesign((d) => ({ ...d, ...patch }));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <form action={action} className={`${card} space-y-4`}>
        <h1 className="text-xl font-bold">{tag ? "Edit tag" : "Make a new tag"}</h1>
        <input type="hidden" name="tagId" value={tag?.id ?? ""} />
        <input type="hidden" name="design" value={JSON.stringify(design)} />

        <div>
          <label className={label} htmlFor="itemName">Item name</label>
          <input id="itemName" name="itemName" maxLength={60} required value={itemName} onChange={(e) => setItemName(e.target.value)} className={input} placeholder="e.g. Blue suitcase" />
        </div>

        <div>
          <label className={label} htmlFor="note">Note for the finder (optional, e.g. a reward)</label>
          <textarea id="note" name="note" maxLength={200} rows={2} defaultValue={tag?.note ?? ""} className={input} />
        </div>

        <div>
          <label className={label} htmlFor="photo">Photo (optional, image ≤ 2 MB)</label>
          <input id="photo" name="photo" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="text-sm" />
          {tag?.photoPath && (
            <label className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" name="removePhoto" /> Remove current photo
            </label>
          )}
        </div>

        <fieldset>
          <legend className={label}>Template</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TEMPLATE_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => update({ template: id })}
                className={`rounded-md border px-2 py-2 text-left text-sm ${design.template === id ? "border-blue-600 bg-blue-50" : "border-gray-300"}`}
              >
                <div className="font-medium">{TEMPLATES[id].label}</div>
                <div className="text-xs text-gray-500">{TEMPLATES[id].widthMm} × {TEMPLATES[id].heightMm} mm</div>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className={label}>Colour</legend>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Colour ${c}`}
                onClick={() => update({ color: c })}
                className={`h-8 w-8 rounded-full ring-offset-2 ${design.color === c ? "ring-2 ring-gray-900" : ""}`}
                style={{ background: c }}
              />
            ))}
          </div>
        </fieldset>

        <div>
          <label className={label} htmlFor="customText">Custom text line</label>
          <input id="customText" maxLength={40} value={design.customText} onChange={(e) => update({ customText: e.target.value })} className={input} />
        </div>

        {state?.error && <p className="text-sm text-red-600" role="alert">{state.error}</p>}
        <button className={btnPrimary} disabled={pending}>{pending ? "Saving…" : tag ? "Save changes" : "Create tag"}</button>
      </form>

      <div className={`${card} flex flex-col items-center justify-center gap-3 bg-gray-50`}>
        <div className="text-sm text-gray-500">Live preview · {TEMPLATES[design.template].label} at real size</div>
        <div className="max-w-full overflow-x-auto p-2">
          <TagPreview itemName={itemName} design={design} code={tag?.code ?? null} siteUrl={siteUrl} />
        </div>
        {!tag && <p className="text-xs text-gray-500">The QR code gets its unique link when you create the tag.</p>}
      </div>
    </div>
  );
}

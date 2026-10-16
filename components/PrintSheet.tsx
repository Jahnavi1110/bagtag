"use client";

import { useRef, useState } from "react";
import { downloadPrintSheet } from "@/lib/exportTag";
import { TEMPLATES } from "@/lib/templates";
import type { Tag } from "@/lib/types";
import { TagPreview } from "./TagPreview";
import { btnPrimary, card } from "./ui";

/** Choose several tags and download them laid out at real size on A4. */
export function PrintSheet({ tags, siteUrl }: { tags: Tag[]; siteUrl: string }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(tags.map((t) => t.id)));
  const [busy, setBusy] = useState(false);
  const nodes = useRef(new Map<string, HTMLDivElement>());

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  async function download() {
    setBusy(true);
    try {
      const items = tags.filter((t) => selected.has(t.id)).map((t) => ({ node: nodes.current.get(t.id)!, template: t.design.template }));
      await downloadPrintSheet(items, "tagback-print-sheet.pdf");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Print sheet (A4)</h1>
        <button className={btnPrimary} disabled={busy || selected.size === 0} onClick={download}>
          {busy ? "Preparing…" : `Download A4 PDF (${selected.size})`}
        </button>
      </div>
      <ul className="grid gap-3 md:grid-cols-2">
        {tags.map((t) => (
          <li key={t.id} className={`${card} space-y-2`}>
            <label className="flex items-center gap-2 font-medium">
              <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggle(t.id)} />
              {t.itemName} <span className="text-sm font-normal text-gray-500">({TEMPLATES[t.design.template].label})</span>
            </label>
            <div className="max-w-full overflow-x-auto">
              <TagPreview
                ref={(el) => {
                  if (el) nodes.current.set(t.id, el);
                }}
                itemName={t.itemName}
                design={t.design}
                code={t.code}
                siteUrl={siteUrl}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

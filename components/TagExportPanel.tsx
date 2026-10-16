"use client";

import { useRef, useState } from "react";
import { downloadPdf, downloadPng } from "@/lib/exportTag";
import { TEMPLATES } from "@/lib/templates";
import type { Tag } from "@/lib/types";
import { TagPreview } from "./TagPreview";
import { btnSecondary } from "./ui";

export function TagExportPanel({ tag, siteUrl }: { tag: Tag; siteUrl: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const fileBase = `tagback-${tag.code}`;

  async function run(kind: "png" | "pdf") {
    if (!ref.current) return;
    setBusy(true);
    try {
      if (kind === "png") await downloadPng(ref.current, `${fileBase}.png`);
      else await downloadPdf(ref.current, tag.design.template, `${fileBase}.pdf`);
    } finally {
      setBusy(false);
    }
  }

  const t = TEMPLATES[tag.design.template];
  return (
    <div className="space-y-3">
      <div className="max-w-full overflow-x-auto rounded-md bg-gray-50 p-4">
        <TagPreview ref={ref} itemName={tag.itemName} design={tag.design} code={tag.code} siteUrl={siteUrl} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button className={btnSecondary} disabled={busy} onClick={() => run("png")}>Download PNG</button>
        <button className={btnSecondary} disabled={busy} onClick={() => run("pdf")}>Download PDF ({t.widthMm} × {t.heightMm} mm)</button>
      </div>
    </div>
  );
}

"use client";

import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { TEMPLATES } from "./templates";
import type { TemplateId } from "./types";

/**
 * Tag export. The preview DOM node is rendered at PX_PER_MM (4 px/mm);
 * a 3x pixel ratio gives ~305 DPI, which prints sharply. The PDF page is
 * exactly the template's real size in millimetres, so printing at 100%
 * produces a tag of the right physical size with a scannable QR code.
 */
export function tagToPng(node: HTMLElement) {
  return toPng(node, { pixelRatio: 3, cacheBust: true });
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

export async function downloadPng(node: HTMLElement, filename: string) {
  triggerDownload(await tagToPng(node), filename);
}

export async function downloadPdf(node: HTMLElement, template: TemplateId, filename: string) {
  const { widthMm: w, heightMm: h } = TEMPLATES[template];
  // jsPDF swaps custom page dimensions unless the orientation matches them.
  const pdf = new jsPDF({ unit: "mm", format: [w, h], orientation: w > h ? "landscape" : "portrait" });
  pdf.addImage(await tagToPng(node), "PNG", 0, 0, w, h);
  pdf.save(filename);
}

/** Lays several tags out on A4 pages at real size, left to right, top to bottom, with light cut lines. */
export async function downloadPrintSheet(items: { node: HTMLElement; template: TemplateId }[], filename: string) {
  const PAGE_W = 210, PAGE_H = 297, MARGIN = 10, GAP = 6;
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  let x = MARGIN, y = MARGIN, rowH = 0;

  for (const { node, template } of items) {
    const { widthMm: w, heightMm: h } = TEMPLATES[template];
    if (x + w > PAGE_W - MARGIN) {
      x = MARGIN;
      y += rowH + GAP;
      rowH = 0;
    }
    if (y + h > PAGE_H - MARGIN) {
      pdf.addPage();
      x = MARGIN;
      y = MARGIN;
      rowH = 0;
    }
    pdf.addImage(await tagToPng(node), "PNG", x, y, w, h);
    pdf.setDrawColor(200);
    pdf.setLineWidth(0.1);
    pdf.rect(x - 1, y - 1, w + 2, h + 2);
    x += w + GAP;
    rowH = Math.max(rowH, h);
  }
  pdf.save(filename);
}

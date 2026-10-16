import type { TagDesign, TemplateId } from "./types";

/**
 * Real-world print sizes in millimetres. The preview renders at PX_PER_MM,
 * and PNG export uses a 3x pixel ratio (~305 DPI), so the PDF is print-accurate.
 * QR codes are never smaller than ~20 mm so phones can still scan them.
 */
export const PX_PER_MM = 4;

export const TEMPLATES: Record<TemplateId, { label: string; widthMm: number; heightMm: number }> = {
  luggage: { label: "Luggage tag", widthMm: 100, heightMm: 55 },
  round: { label: "Round sticker", widthMm: 50, heightMm: 50 },
  keychain: { label: "Keychain", widthMm: 35, heightMm: 55 },
  school: { label: "School-bag label", widthMm: 90, heightMm: 40 },
  laptop: { label: "Laptop sticker", widthMm: 70, heightMm: 45 },
};

export const TEMPLATE_IDS = Object.keys(TEMPLATES) as TemplateId[];

export const COLORS = ["#2563eb", "#dc2626", "#16a34a", "#9333ea", "#ea580c", "#0f172a"];

export const DEFAULT_DESIGN: TagDesign = { template: "luggage", color: COLORS[0], customText: "Please scan if found" };

export const tagUrl = (siteUrl: string, code: string) => `${siteUrl.replace(/\/$/, "")}/t/${code}`;

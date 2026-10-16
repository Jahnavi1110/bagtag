import type { TagDesign } from "@/lib/types";

export type TemplateProps = {
  itemName: string;
  design: TagDesign;
  code: string;
  /** QR code as a data URL (always black on white for reliable scanning). */
  qr: string | null;
};

/** Converts millimetres to preview pixels (see PX_PER_MM). */
export const mm = (n: number) => n * 4;

"use client";

import { useEffect, useState, type Ref } from "react";
import QRCode from "qrcode";
import { TEMPLATE_COMPONENTS } from "./templates";
import { tagUrl } from "@/lib/templates";
import type { TagDesign } from "@/lib/types";

type Props = { itemName: string; design: TagDesign; code: string | null; siteUrl: string; ref?: Ref<HTMLDivElement> };

/** Renders the chosen template at real-world scale with a QR pointing to /t/<code>. */
export function TagPreview({ itemName, design, code, siteUrl, ref }: Props) {
  const [qr, setQr] = useState<string | null>(null);
  const url = tagUrl(siteUrl, code ?? "PREVIEW");

  useEffect(() => {
    let alive = true;
    // Error correction "M" keeps modules large enough to scan on 25 mm stickers.
    QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 1, width: 600 }).then((d) => alive && setQr(d));
    return () => {
      alive = false;
    };
  }, [url]);

  const Template = TEMPLATE_COMPONENTS[design.template];
  return (
    <div ref={ref} className="inline-block" data-testid="tag-preview" data-ready={qr ? "true" : "false"}>
      <Template itemName={itemName} design={design} code={code ?? "--------"} qr={qr} />
    </div>
  );
}

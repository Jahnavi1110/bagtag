import { Qr } from "./Qr";
import { mm, type TemplateProps } from "./types";

/** 70 × 45 mm laptop sticker. */
export function LaptopSticker({ itemName, design, code, qr }: TemplateProps) {
  return (
    <div
      className="flex items-center gap-[12px] rounded-[20px] px-[14px] text-white"
      style={{ width: mm(70), height: mm(45), background: `linear-gradient(135deg, ${design.color}, #111827)` }}
    >
      <Qr src={qr} sizeMm={30} />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-[0.2em] opacity-75">Found me?</div>
        <div className="mt-1 break-words text-[17px] font-bold leading-tight">{itemName || "Item name"}</div>
        <div className="mt-1 text-[11px] leading-snug opacity-90">{design.customText}</div>
        <div className="mt-2 font-mono text-[10px] tracking-widest opacity-75">{code}</div>
      </div>
    </div>
  );
}

import { Qr } from "./Qr";
import { mm, type TemplateProps } from "./types";

/** 50 mm round sticker. */
export function RoundSticker({ itemName, design, code, qr }: TemplateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-[4px] rounded-full text-center text-white"
      style={{ width: mm(50), height: mm(50), background: design.color }}
    >
      <div className="max-w-[140px] truncate text-[13px] font-bold">{itemName || "Item name"}</div>
      <Qr src={qr} sizeMm={25} />
      <div className="font-mono text-[10px] tracking-widest opacity-90">{code}</div>
    </div>
  );
}

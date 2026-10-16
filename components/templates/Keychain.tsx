import { Qr } from "./Qr";
import { mm, type TemplateProps } from "./types";

/** 35 × 55 mm keychain fob with a ring hole at the top. */
export function Keychain({ itemName, design, code, qr }: TemplateProps) {
  return (
    <div
      className="flex flex-col items-center justify-between rounded-[28px] pb-[10px] pt-[12px] text-center text-white"
      style={{ width: mm(35), height: mm(55), background: design.color }}
    >
      <div className="h-[18px] w-[18px] rounded-full bg-white" />
      <div className="w-full truncate px-[8px] text-[12px] font-bold">{itemName || "Item name"}</div>
      <Qr src={qr} sizeMm={27} />
      <div className="font-mono text-[10px] tracking-widest opacity-90">{code}</div>
    </div>
  );
}

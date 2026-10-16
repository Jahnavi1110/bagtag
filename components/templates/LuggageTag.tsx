import { Qr } from "./Qr";
import { mm, type TemplateProps } from "./types";

/** 100 × 55 mm luggage tag with a punch hole. */
export function LuggageTag({ itemName, design, code, qr }: TemplateProps) {
  return (
    <div className="relative flex overflow-hidden rounded-[24px] text-white" style={{ width: mm(100), height: mm(55), background: design.color }}>
      <div className="absolute left-[18px] top-1/2 h-[28px] w-[28px] -translate-y-1/2 rounded-full border-4 border-white/70 bg-white" />
      <div className="flex flex-1 flex-col justify-between py-[20px] pl-[64px] pr-[12px]">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.2em] opacity-80">If found</div>
          <div className="mt-1 text-[24px] font-bold leading-tight">{itemName || "Item name"}</div>
          <div className="mt-2 text-[14px] leading-snug opacity-90">{design.customText}</div>
        </div>
        <div className="font-mono text-[13px] tracking-widest opacity-80">tagback · {code}</div>
      </div>
      <div className="flex items-center pr-[20px]">
        <Qr src={qr} sizeMm={38} />
      </div>
    </div>
  );
}

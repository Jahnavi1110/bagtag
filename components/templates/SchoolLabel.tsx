import { Qr } from "./Qr";
import { mm, type TemplateProps } from "./types";

/** 90 × 40 mm school-bag label: white label with a coloured stripe. */
export function SchoolLabel({ itemName, design, code, qr }: TemplateProps) {
  return (
    <div className="flex overflow-hidden rounded-[12px] border-2 bg-white" style={{ width: mm(90), height: mm(40), borderColor: design.color }}>
      <div className="w-[24px]" style={{ background: design.color }} />
      <div className="flex flex-1 flex-col justify-center gap-[6px] px-[16px]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: design.color }}>
          This bag belongs to
        </div>
        <div className="text-[22px] font-display font-black tracking-tight leading-tight text-gray-900">{itemName || "Item name"}</div>
        <div className="text-[13px] text-gray-600">{design.customText}</div>
        <div className="font-mono text-[11px] tracking-widest text-gray-500">{code}</div>
      </div>
      <div className="flex items-center pr-[12px]">
        <Qr src={qr} sizeMm={32} />
      </div>
    </div>
  );
}

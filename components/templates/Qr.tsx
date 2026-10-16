/* eslint-disable @next/next/no-img-element -- data URL, exported by html-to-image */
import { mm } from "./types";

/** QR square with a white quiet zone, sized in millimetres. */
export function Qr({ src, sizeMm }: { src: string | null; sizeMm: number }) {
  return (
    <div className="shrink-0 rounded-sm bg-white p-[3px]" style={{ width: mm(sizeMm), height: mm(sizeMm) }}>
      {src ? <img src={src} alt="QR code" className="h-full w-full [image-rendering:pixelated]" /> : <div className="h-full w-full bg-gray-200" />}
    </div>
  );
}

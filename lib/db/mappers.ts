import { DEFAULT_DESIGN } from "@/lib/templates";
import type { Message, Tag, TagDesign } from "@/lib/types";

export type TagRow = {
  id: string;
  code: string;
  item_name: string;
  photo_path: string | null;
  note: string | null;
  design: string;
  status: Tag["status"];
  scan_count: number;
  created_at: string;
};

export type MessageRow = {
  id: string;
  sender: Message["sender"];
  body: string;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

export function parseDesign(json: string): TagDesign {
  try {
    return { ...DEFAULT_DESIGN, ...JSON.parse(json) };
  } catch {
    return DEFAULT_DESIGN;
  }
}

export function toTag(r: TagRow): Tag {
  return {
    id: r.id,
    code: r.code,
    itemName: r.item_name,
    photoPath: r.photo_path,
    note: r.note,
    design: parseDesign(r.design),
    status: r.status,
    scanCount: r.scan_count,
    createdAt: r.created_at,
  };
}

export function toMessage(r: MessageRow): Message {
  return { id: r.id, sender: r.sender, body: r.body, lat: r.lat, lng: r.lng, createdAt: r.created_at };
}

export const photoUrl = (photoPath: string | null) => (photoPath ? `/api/uploads/${photoPath}` : null);

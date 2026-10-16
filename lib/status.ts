import type { TagStatus } from "./types";

/** Allowed status changes for a tag. */
export const STATUS_TRANSITIONS: Record<TagStatus, TagStatus[]> = {
  safe: ["lost"],
  lost: ["found", "safe"],
  found: ["safe", "lost"],
};

export function canTransition(from: TagStatus, to: TagStatus) {
  return STATUS_TRANSITIONS[from].includes(to);
}

export const STATUS_LABEL: Record<TagStatus, string> = { safe: "Safe", lost: "Lost", found: "Found" };

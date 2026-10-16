import { STATUS_LABEL } from "@/lib/status";
import type { TagStatus } from "@/lib/types";

const STYLES: Record<TagStatus, string> = {
  safe: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
  found: "bg-amber-100 text-amber-800",
};

export function StatusBadge({ status }: { status: TagStatus }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[status]}`}>{STATUS_LABEL[status]}</span>;
}

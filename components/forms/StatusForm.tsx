import { changeStatus } from "@/lib/actions/tags";
import { STATUS_LABEL, STATUS_TRANSITIONS } from "@/lib/status";
import type { TagStatus } from "@/lib/types";
import { btnSecondary } from "../ui";

export function StatusForm({ tagId, status }: { tagId: string; status: TagStatus }) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_TRANSITIONS[status].map((to) => (
        <form key={to} action={changeStatus}>
          <input type="hidden" name="tagId" value={tagId} />
          <input type="hidden" name="status" value={to} />
          <button className={btnSecondary}>Mark as {STATUS_LABEL[to]}</button>
        </form>
      ))}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { TagStatus } from "@/lib/types";
import { FinderMessageForm } from "./forms/FinderMessageForm";
import { moodForStatus, Tagby } from "./mascot/Tagby";
import { card } from "./ui";

/** Message form with Tagby beside it. Tagby's mood follows the tag status and celebrates for 2 s after a message is sent. */
export function FinderPanel({ code, status }: { code: string; status: TagStatus }) {
  const [celebrating, setCelebrating] = useState(false);
  useEffect(() => {
    if (!celebrating) return;
    const t = window.setTimeout(() => setCelebrating(false), 2000);
    return () => window.clearTimeout(t);
  }, [celebrating]);

  return (
    <div className="grid items-end gap-4 wide:grid-cols-[minmax(0,1fr)_200px]">
      <div className={`${card} order-2 wide:order-1`}>
        <FinderMessageForm code={code} onSent={() => setCelebrating(true)} />
      </div>
      <div className="order-1 flex h-44 justify-center wide:order-2 wide:h-64" data-testid="finder-tagby">
        <Tagby mood={celebrating ? "celebrating" : moodForStatus(status)} size="100%" />
      </div>
    </div>
  );
}

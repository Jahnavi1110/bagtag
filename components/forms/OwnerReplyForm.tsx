"use client";

import { useActionState, useEffect, useRef } from "react";
import { replyAsOwner } from "@/lib/actions/tags";
import { btnPrimary, input } from "../ui";

export function OwnerReplyForm({ conversationId }: { conversationId: string }) {
  const [state, action, pending] = useActionState(replyAsOwner, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-3 flex gap-2">
      <input type="hidden" name="conversationId" value={conversationId} />
      <input name="body" required maxLength={1000} placeholder="Reply to the finder…" className={input} aria-label="Reply" />
      <button className={btnPrimary} disabled={pending}>Send</button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}

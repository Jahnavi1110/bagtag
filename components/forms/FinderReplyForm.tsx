"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnPrimary, input } from "../ui";

export function FinderReplyForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setPending(true);
    setError(null);
    const res = await fetch("/api/finder/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, body: fd.get("body"), website: fd.get("website") }),
    });
    setPending(false);
    if (!res.ok) return setError((await res.json().catch(() => ({}))).error ?? "Something went wrong");
    form.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex gap-2">
      <input name="body" required maxLength={1000} placeholder="Write a message…" className={input} aria-label="Message" />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0" />
      <button className={btnPrimary} disabled={pending}>Send</button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

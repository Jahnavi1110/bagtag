"use client";

import Link from "next/link";
import { useState } from "react";
import { btnPrimary, input, label } from "../ui";

/** Opt-in only: asks the browser for the finder's position when they tick the box and send. */
function getPosition(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: Number(p.coords.latitude.toFixed(5)), lng: Number(p.coords.longitude.toFixed(5)) }),
      () => resolve(null),
      { timeout: 10_000 },
    );
  });
}

export function FinderMessageForm({ code }: { code: string }) {
  const [chatPath, setChatPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const pos = fd.get("shareLocation") === "on" ? await getPosition() : null;
    const res = await fetch("/api/finder/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, body: fd.get("body"), website: fd.get("website"), lat: pos?.lat ?? null, lng: pos?.lng ?? null }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) return setError(data.error ?? "Something went wrong");
    setChatPath(data.chatPath);
  }

  if (chatPath) {
    const full = `${window.location.origin}${chatPath}`;
    return (
      <div className="space-y-3 rounded-lg border border-green-300 bg-green-50 p-4" data-testid="finder-success">
        <p className="font-semibold text-green-900">Thank you! Your message was sent to the owner anonymously.</p>
        <p className="text-sm text-green-900">
          Save this private link. It is the only way to read the owner&apos;s reply, and nobody else has it:
        </p>
        <code className="block break-all rounded bg-white p-2 text-xs">{full}</code>
        <div className="flex gap-2">
          <button type="button" className={btnPrimary} onClick={() => navigator.clipboard?.writeText(full)}>Copy link</button>
          <Link href={chatPath} className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm">Open chat</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className={label} htmlFor="body">Message to the owner</label>
        <textarea id="body" name="body" required maxLength={1000} rows={4} className={input} placeholder="Where did you find it? How can they get it back?" />
      </div>
      {/* Honeypot: hidden from people, often filled in by spam bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name="shareLocation" /> Share my current location with the owner (optional)
      </label>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button className={btnPrimary} disabled={pending}>{pending ? "Sending…" : "Send message"}</button>
      <p className="text-xs text-gray-500">You stay anonymous: the owner never sees your name, email or phone number.</p>
    </form>
  );
}

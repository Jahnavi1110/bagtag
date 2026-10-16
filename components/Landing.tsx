import Link from "next/link";
import { btnPrimary, btnSecondary, card } from "./ui";

const STEPS = [
  { title: "1. Make a tag", body: "Pick a template (luggage tag, sticker, keychain…), add your item name and print it with its QR code." },
  { title: "2. Someone scans it", body: "The finder sees only the item and your note, never your email or phone, and sends you a message." },
  { title: "3. Chat anonymously", body: "Reply from your dashboard. The finder reads your answer through a private link only they hold." },
];

export function Landing() {
  return (
    <div className="space-y-10 py-10">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Lost it? Get it back.</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          Tagback makes QR bag tags that let anyone who finds your things message you without either of you revealing who you are.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/signup" className={btnPrimary}>Make your first tag</Link>
          <Link href="/login" className={btnSecondary}>Log in</Link>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <div key={s.title} className={card}>
            <h2 className="font-semibold">{s.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{s.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

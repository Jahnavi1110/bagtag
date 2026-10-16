import Link from "next/link";
import { Tagby } from "./mascot/Tagby";
import { card } from "./ui";

export function NotFoundView({ title, body, mascot = false }: { title: string; body: string; mascot?: boolean }) {
  return (
    <div className={`${card} mx-auto mt-12 max-w-md text-center`}>
      {mascot ? (
        <div className="flex justify-center">
          <Tagby mood="neutral" size={150} trackPointer={false} label="Tagby looking around" />
        </div>
      ) : (
        <div className="font-display text-5xl font-black text-ink/20">404</div>
      )}
      <h1 className="mt-2 text-2xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">{body}</p>
      <Link href="/" className="mt-4 inline-block text-sm underline underline-offset-4">Go to Tagback</Link>
    </div>
  );
}

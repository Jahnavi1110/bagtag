import Link from "next/link";
import { Wordmark } from "../brand/Wordmark";
import { Tagby, type TagbyMood } from "../mascot/Tagby";

/**
 * Landing page in a playful "creative studio" style (design language adapted
 * from the motionsites.ai "Playful Idea" template). Desktop (>700px) is a
 * one-viewport, three-column composition positioned in vw units; mobile stacks.
 */
const NAV = [
  { href: "#how", label: "How it works" },
  { href: "/tags/new", label: "Make a tag" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/login", label: "Log in" },
];

const STEPS: { n: string; title: string; body: string; mood: TagbyMood }[] = [
  { n: "01", title: "Make a tag", body: "Pick a luggage tag, sticker, keychain or label, add your item and print it at real size.", mood: "neutral" },
  { n: "02", title: "Stick it on", body: "Each tag carries a QR code that opens a public page showing only your item and note.", mood: "happy" },
  { n: "03", title: "Get a message", body: "Whoever finds it writes to you. You reply from your dashboard; nobody shares a name or number.", mood: "celebrating" },
];

const badge = "inline-block rounded-[100px] bg-pill px-3.5 py-1.5 text-sm";
const headline = "font-display text-[clamp(2.25rem,11vw,3.25rem)] font-black leading-[0.95] tracking-[-0.03em] wide:text-[2.7vw]";

export function Landing() {
  return (
    <div className="bg-canvas text-ink">
      <section className="relative px-5 pb-6 pt-8 wide:h-screen wide:min-h-[560px] wide:overflow-hidden wide:p-0">
        {/* centre: wordmark */}
        <div className="relative z-10 mx-auto w-44 wide:absolute wide:left-[40vw] wide:top-[7.7vw] wide:mx-0 wide:w-[17vw]">
          <Wordmark className="w-full" />
        </div>

        {/* left block */}
        <div className="relative z-10 mt-10 wide:absolute wide:left-[8.65vw] wide:top-[7.7vw] wide:mt-0 wide:w-[25vw]">
          <span className={badge}>lost something?</span>
          <h1 className={`${headline} mt-4`}>
            tag it once,
            <br />
            find it again
          </h1>
          <nav aria-label="Main" className="mt-7 grid grid-cols-2 gap-2 wide:mt-[2.6vw] wide:flex wide:flex-col wide:gap-1.5">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex min-h-11 items-center rounded-[100px] bg-pill px-4 text-base wide:min-h-0 wide:w-fit wide:bg-transparent wide:px-0 wide:py-0.5 wide:text-[1.15vw] wide:underline-offset-4 wide:hover:underline"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* right block */}
        <div className="relative z-10 mt-12 wide:absolute wide:left-[72vw] wide:top-[7.7vw] wide:mt-0 wide:w-[23vw]">
          <span className={badge}>found something?</span>
          <h2 className={`${headline} mt-4`}>
            scan the tag.
            <br />
            say hello*
          </h2>
          <p className="mt-4 max-w-xs text-sm text-muted wide:text-[0.95vw]">*no names, no numbers. just a message back to the owner.</p>
          <Link
            href="/tags/new"
            className="mt-6 inline-flex min-h-11 items-center rounded-[100px] bg-ink px-6 text-base text-canvas hover:bg-ink/85 wide:text-[1.1vw]"
          >
            Make your first tag →
          </Link>
        </div>

        {/* Tagby: behind the text on desktop, in normal flow on mobile */}
        <div className="pointer-events-none relative z-0 mt-10 flex h-[clamp(260px,85vw,420px)] justify-center wide:absolute wide:bottom-0 wide:left-1/2 wide:mt-0 wide:h-[55vh] wide:-translate-x-1/2">
          <Tagby mood="happy" size="100%" />
        </div>
      </section>

      <section id="how" className="px-5 py-16 wide:px-[8.65vw] wide:py-24">
        <span className={badge}>how it works</span>
        <ol className="mt-10 grid gap-12 wide:grid-cols-3 wide:gap-[4vw]">
          {STEPS.map((s, i) => (
            <li key={s.n} className="flex flex-col items-start">
              <Tagby mood={s.mood} size={150} label={`Tagby: ${s.title}`} />
              <div className="mt-5 text-sm text-muted">
                {s.n}
                {i < STEPS.length - 1 && <span aria-hidden="true"> →</span>}
              </div>
              <h3 className="font-display text-3xl font-black tracking-[-0.03em]">{s.title}</h3>
              <p className="mt-2 max-w-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

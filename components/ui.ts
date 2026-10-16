/** Shared Tailwind class strings, kept in one place for the later redesign. Colours come from app/tokens.css. */
export const btn = "inline-flex items-center justify-center gap-2 rounded-[100px] px-4 py-2 text-sm disabled:opacity-50";
export const btnPrimary = `${btn} bg-ink text-canvas hover:bg-ink/85`;
export const btnSecondary = `${btn} border border-ink/15 bg-pill text-ink hover:bg-white`;
export const btnDanger = `${btn} border border-red-300 bg-pill text-red-700 hover:bg-red-50`;
export const input = "w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none";
export const label = "mb-1 block text-sm text-muted";
export const card = "rounded-2xl border border-ink/5 bg-white p-5";

/**
 * Original hand-drawn "tagback" wordmark: monoline script strokes drawn as
 * paths, with a small tag-hole ring over the final k. Uses currentColor.
 * The same paths are in public/logo.svg (favicon); keep them in sync.
 */
export const WORDMARK_VIEWBOX = "0 0 320 124";

export const WORDMARK_PATHS = [
  // t
  "M22 14 C22 44 20 74 24 88 C26 95 35 95 41 88",
  "M9 41 C20 39 30 38 41 39",
  // a
  "M77 50 C69 38 50 40 48 62 C46 83 63 92 74 80 C78 75 79 66 79 54 C79 71 80 85 89 91",
  // g
  "M125 50 C117 38 97 40 95 62 C93 80 111 88 123 76",
  "M126 47 C127 70 127 96 123 108 C117 123 97 121 93 109",
  // b
  "M146 12 C146 40 146 70 147 90",
  "M147 67 C152 48 177 44 179 66 C181 87 160 97 148 88",
  // a (second)
  "M218 50 C210 38 191 40 189 62 C187 83 204 92 215 80 C219 75 220 66 220 54 C220 71 221 85 230 91",
  // c
  "M266 52 C258 40 238 42 236 64 C234 86 254 95 268 83",
  // k
  "M280 12 C280 40 280 70 281 92",
  "M306 48 C296 58 288 64 282 68 C292 74 300 84 311 92",
];

export function Wordmark({ className, title = "tagback" }: { className?: string; title?: string }) {
  return (
    <svg viewBox={WORDMARK_VIEWBOX} className={className} role="img" aria-label={title} fill="none">
      <g stroke="currentColor" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        {WORDMARK_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
        {/* tag hole over the k */}
        <circle cx={300} cy={20} r={7} strokeWidth={4.5} />
      </g>
    </svg>
  );
}

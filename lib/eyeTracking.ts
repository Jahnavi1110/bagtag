export type Vec = { x: number; y: number };

/**
 * Where a pupil should sit (in SVG units, relative to the eye centre) so it
 * looks at the pointer.
 *  1. Vector from the eye's on-screen centre to the pointer (screen px).
 *  2. Convert px → SVG units by dividing by pxPerUnit, so the maths stays
 *     correct however large the SVG is drawn.
 *  3. Clamp the length to `ratio` × eye radius (pupils never leave the eye);
 *     close to the eye the offset shrinks smoothly instead of snapping.
 */
export function pupilTarget(eye: Vec, pointer: Vec, pxPerUnit: number, eyeRadius: number, ratio = 0.35): Vec {
  const dx = (pointer.x - eye.x) / pxPerUnit;
  const dy = (pointer.y - eye.y) / pxPerUnit;
  const dist = Math.hypot(dx, dy);
  if (dist < 1e-6) return { x: 0, y: 0 };
  const max = eyeRadius * ratio;
  const len = Math.min(max, dist / 6);
  return { x: (dx / dist) * len, y: (dy / dist) * len };
}

/** Linear interpolation, used once per animation frame to ease the pupils toward their target. */
export const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

import { describe, expect, it } from "vitest";
import { lerp, pupilTarget } from "@/lib/eyeTracking";

describe("eye tracking maths", () => {
  it("points the pupil toward the pointer", () => {
    const p = pupilTarget({ x: 100, y: 100 }, { x: 0, y: 100 }, 1, 15);
    expect(p.x).toBeLessThan(0);
    expect(p.y).toBeCloseTo(0);
  });

  it("clamps the offset to 35% of the eye radius", () => {
    const p = pupilTarget({ x: 0, y: 0 }, { x: 5000, y: 5000 }, 1, 15);
    expect(Math.hypot(p.x, p.y)).toBeCloseTo(15 * 0.35);
  });

  it("gives the same direction regardless of how large the SVG is drawn", () => {
    const small = pupilTarget({ x: 0, y: 0 }, { x: 300, y: -400 }, 1, 15);
    const big = pupilTarget({ x: 0, y: 0 }, { x: 300, y: -400 }, 4, 15);
    expect(Math.atan2(big.y, big.x)).toBeCloseTo(Math.atan2(small.y, small.x));
  });

  it("returns no offset when the pointer is on the eye centre", () => {
    expect(pupilTarget({ x: 10, y: 10 }, { x: 10, y: 10 }, 1, 15)).toEqual({ x: 0, y: 0 });
  });

  it("lerp eases part of the way", () => {
    expect(lerp(0, 10, 0.15)).toBeCloseTo(1.5);
  });
});

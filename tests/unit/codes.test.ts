import { describe, expect, it } from "vitest";
import { CODE_ALPHABET, CODE_LENGTH, generateCode, isValidCode } from "@/lib/codes";

describe("tag codes", () => {
  it("are 8 characters from the unambiguous alphabet", () => {
    const code = generateCode();
    expect(code).toHaveLength(CODE_LENGTH);
    expect(isValidCode(code)).toBe(true);
  });

  it("never contain ambiguous characters", () => {
    for (const c of "01ILO") expect(CODE_ALPHABET).not.toContain(c);
    for (let i = 0; i < 1000; i++) expect(generateCode()).not.toMatch(/[01ILO]/);
  });

  it("are unique over 10,000 generations", () => {
    const codes = new Set(Array.from({ length: 10_000 }, () => generateCode()));
    expect(codes.size).toBe(10_000);
  });

  it("rejects malformed codes", () => {
    expect(isValidCode("ABC")).toBe(false);
    expect(isValidCode("ABCDEFG0")).toBe(false);
    expect(isValidCode("abcdefgh")).toBe(false);
  });
});

import { customAlphabet } from "nanoid";

/** No 0/O or 1/I/L: codes may be typed in by hand from a printed tag. */
export const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const CODE_LENGTH = 8;

export const generateCode = customAlphabet(CODE_ALPHABET, CODE_LENGTH);

const CODE_RE = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);
export const isValidCode = (code: string) => CODE_RE.test(code);

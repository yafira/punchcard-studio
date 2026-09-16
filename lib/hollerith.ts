import { IBM_ROW_LABELS } from "./cardformats";

export interface HollerithResult {
  /** row-major, 1 = light/unpunched, 0 = dark/punched, same convention as the rest of the app */
  cells: Uint8Array;
  /** characters in the input that aren't covered by this encoder (digits/letters/space only) */
  unsupported: string[];
}

const ROWS = IBM_ROW_LABELS.length; // 12: "12","11","0","1",...,"9"

function rowIndex(label: string): number {
  return IBM_ROW_LABELS.indexOf(label);
}

/** Encodes a single character into a 12-cell column (top row first), per the standard Hollerith code. */
function encodeChar(ch: string): Uint8Array {
  const col = new Uint8Array(ROWS).fill(1);
  const c = ch.toUpperCase();

  function punch(label: string) {
    const idx = rowIndex(label);
    if (idx >= 0) col[idx] = 0;
  }

  if (c === " ") return col; // blank column, no punches

  if (/^[0-9]$/.test(c)) {
    punch(c); // single digit-row punch
    return col;
  }
  if (/^[A-I]$/.test(c)) {
    punch("12");
    punch(String(c.charCodeAt(0) - "A".charCodeAt(0) + 1)); // A=1 ... I=9
    return col;
  }
  if (/^[J-R]$/.test(c)) {
    punch("11");
    punch(String(c.charCodeAt(0) - "J".charCodeAt(0) + 1)); // J=1 ... R=9
    return col;
  }
  if (/^[S-Z]$/.test(c)) {
    punch("0");
    punch(String(c.charCodeAt(0) - "S".charCodeAt(0) + 2)); // S=2 ... Z=9
    return col;
  }

  return col; // unsupported character: left blank, caller is told which ones
}

/**
 * Encodes a line of text into an IBM-card-shaped grid: `columns` wide, 12
 * rows tall, one character per column, truncated/padded to fit. Covers
 * uppercase letters, digits, and spaces — the standard punctuation/symbol
 * set of the real 029 code (&, #, %, etc.) isn't implemented, and those
 * characters come through as blank columns rather than guessed at.
 */
export function encodeText(text: string, columns: number): HollerithResult {
  const cells = new Uint8Array(columns * ROWS).fill(1);
  const unsupported: string[] = [];

  for (let c = 0; c < Math.min(text.length, columns); c++) {
    const ch = text[c];
    const known = ch === " " || /[0-9A-Za-z]/.test(ch);
    if (!known && !unsupported.includes(ch)) unsupported.push(ch);

    const colData = encodeChar(ch);
    for (let r = 0; r < ROWS; r++) {
      cells[r * columns + c] = colData[r];
    }
  }

  return { cells, unsupported };
}

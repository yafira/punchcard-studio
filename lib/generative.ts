export type GenerativeAlgorithm = "stripes" | "checkerboard" | "noise" | "automaton";

export interface GenerativeOptions {
  algorithm: GenerativeAlgorithm;
  seed: number;
  /** stripes: width in cells. checkerboard: block size in cells. */
  scale: number;
  /** noise: density 0-1, fraction of cells punched */
  density: number;
  /** automaton: Wolfram elementary CA rule number, 0-255 */
  rule: number;
}

function mulberry32(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stripes(cols: number, rows: number, scale: number): Uint8Array {
  const out = new Uint8Array(cols * rows).fill(1);
  const width = Math.max(1, Math.round(scale));
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const band = Math.floor(x / width);
      out[y * cols + x] = band % 2 === 0 ? 0 : 1;
    }
  }
  return out;
}

function checkerboard(cols: number, rows: number, scale: number): Uint8Array {
  const out = new Uint8Array(cols * rows).fill(1);
  const block = Math.max(1, Math.round(scale));
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const bx = Math.floor(x / block);
      const by = Math.floor(y / block);
      out[y * cols + x] = (bx + by) % 2 === 0 ? 0 : 1;
    }
  }
  return out;
}

function noise(cols: number, rows: number, seed: number, density: number): Uint8Array {
  const rand = mulberry32(seed);
  const out = new Uint8Array(cols * rows);
  for (let i = 0; i < cols * rows; i++) {
    out[i] = rand() < density ? 0 : 1;
  }
  return out;
}

/**
 * Elementary cellular automaton (Wolfram rule), seeded with a single punched
 * cell in the middle of row 0 and evolved row by row. Uses wraparound
 * (circular) boundaries — column 23's right neighbor is column 0 — which
 * matches how a punch card actually behaves physically once it's taped into
 * a loop, rather than treating the edges as a wall.
 */
function automaton(cols: number, rows: number, rule: number): Uint8Array {
  const out = new Uint8Array(cols * rows).fill(1);
  let current = new Uint8Array(cols).fill(1); // 1 = light, matches shared convention
  current[Math.floor(cols / 2)] = 0; // seed: one punched cell, centered

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) out[y * cols + x] = current[x];

    const next = new Uint8Array(cols);
    for (let x = 0; x < cols; x++) {
      const left = current[(x - 1 + cols) % cols] === 0 ? 1 : 0; // 1 = punched, for rule lookup
      const center = current[x] === 0 ? 1 : 0;
      const right = current[(x + 1) % cols] === 0 ? 1 : 0;
      const pattern = (left << 2) | (center << 1) | right;
      const punched = (rule >> pattern) & 1;
      next[x] = punched ? 0 : 1;
    }
    current = next;
  }
  return out;
}

export function generatePattern(cols: number, rows: number, options: GenerativeOptions): Uint8Array {
  switch (options.algorithm) {
    case "stripes":
      return stripes(cols, rows, options.scale);
    case "checkerboard":
      return checkerboard(cols, rows, options.scale);
    case "noise":
      return noise(cols, rows, options.seed, options.density);
    case "automaton":
      return automaton(cols, rows, options.rule);
  }
}

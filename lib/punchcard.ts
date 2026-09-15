const PAPER = "#FFF8F0";
const WISTERIA = "#8B5CF6";
const LABEL = "#9B87A6";
const LINE = "#ECDFF0";

/** Creates a blank (all-light/unpunched) grid for the given columns x rows. */
export function makeBlankGrid(columns: number, rows: number): Uint8Array {
  return new Uint8Array(columns * rows).fill(1);
}

/**
 * Resizes a grid to a new row count, preserving overlapping content from the
 * top and padding any new rows as unpunched, rather than discarding work
 * when the row count changes. Column count is assumed fixed across a resize
 * (switching card formats replaces the grid outright instead).
 */
export function resizeGridRows(cells: Uint8Array, columns: number, oldRows: number, newRows: number): Uint8Array {
  const next = makeBlankGrid(columns, newRows);
  const rowsToCopy = Math.min(oldRows, newRows);
  next.set(cells.subarray(0, rowsToCopy * columns));
  return next;
}

export interface PunchCardSVGOptions {
  /** custom row labels (e.g. IBM's ["12","11","0",...]); defaults to sequential 1..rows */
  rowLabels?: string[];
  /** how often to print a column number along the column axis; default 4 */
  colLabelEvery?: number;
  orientation?: "normal" | "rotated";
  /** real physical spacing between column centers, in millimeters */
  columnPitchMM: number;
  /** real physical spacing between row centers, in millimeters */
  rowPitchMM: number;
  /** hole diameter as a fraction of the smaller pitch dimension; default 0.55 */
  holeDiameterRatio?: number;
}

/**
 * Builds a punch card SVG at true physical size (mm), not arbitrary pixels —
 * necessary if the output is meant to be printed and hand-punched, or
 * imported into craft-cutter software (Silhouette Studio, Cricut Design
 * Space) for a precisely cut card, rather than just viewed as a reference.
 *
 * `cells` follows the shared convention: 1 = light/unpunched, 0 = dark/punched,
 * stored row-major as cells[row * columns + col].
 *
 * "rotated" transposes the whole rendering — what was the row axis becomes
 * the horizontal axis and vice versa, including swapping which pitch value
 * governs which drawn axis.
 */
export function generatePunchCardSVG(
  cells: Uint8Array,
  columns: number,
  rows: number,
  options: PunchCardSVGOptions
): string {
  const rotated = options.orientation === "rotated";
  const rowLabels = options.rowLabels ?? Array.from({ length: rows }, (_, i) => String(i + 1));
  const colLabelEvery = options.colLabelEvery ?? 4;
  const holeDiameterRatio = options.holeDiameterRatio ?? 0.55;

  // drawn axes are what's actually laid out left-to-right / top-to-bottom.
  // rotation swaps both which count applies (columns vs rows) AND which
  // physical pitch governs that axis, since pitch is a property of the
  // logical axis, not the page.
  const drawCols = rotated ? rows : columns;
  const drawRows = rotated ? columns : rows;
  const drawColPitch = rotated ? options.rowPitchMM : options.columnPitchMM;
  const drawRowPitch = rotated ? options.columnPitchMM : options.rowPitchMM;

  const marginLeftMM = 12;
  const marginTopMM = 8;
  const marginRightMM = 4;
  const marginBottomMM = 4;
  const widthMM = marginLeftMM + drawCols * drawColPitch + marginRightMM;
  const heightMM = marginTopMM + drawRows * drawRowPitch + marginBottomMM;

  const holeRadiusMM = (Math.min(drawColPitch, drawRowPitch) * holeDiameterRatio) / 2;

  const holes: string[] = [];
  const gridLines: string[] = [];

  for (let c = 0; c <= drawCols; c++) {
    const x = marginLeftMM + c * drawColPitch;
    gridLines.push(
      `<line x1="${x.toFixed(3)}" y1="${marginTopMM.toFixed(3)}" x2="${x.toFixed(3)}" y2="${(marginTopMM + drawRows * drawRowPitch).toFixed(3)}" stroke="${LINE}" stroke-width="0.1" />`
    );
  }
  for (let r = 0; r <= drawRows; r++) {
    const y = marginTopMM + r * drawRowPitch;
    gridLines.push(
      `<line x1="${marginLeftMM.toFixed(3)}" y1="${y.toFixed(3)}" x2="${(marginLeftMM + drawCols * drawColPitch).toFixed(3)}" y2="${y.toFixed(3)}" stroke="${LINE}" stroke-width="0.1" />`
    );
  }

  for (let dr = 0; dr < drawRows; dr++) {
    for (let dc = 0; dc < drawCols; dc++) {
      const logicalRow = rotated ? dc : dr;
      const logicalCol = rotated ? dr : dc;
      const punched = cells[logicalRow * columns + logicalCol] === 0;
      const cx = marginLeftMM + (dc + 0.5) * drawColPitch;
      const cy = marginTopMM + (dr + 0.5) * drawRowPitch;
      holes.push(
        punched
          ? `<circle cx="${cx.toFixed(3)}" cy="${cy.toFixed(3)}" r="${holeRadiusMM.toFixed(3)}" fill="${WISTERIA}" />`
          : `<circle cx="${cx.toFixed(3)}" cy="${cy.toFixed(3)}" r="${holeRadiusMM.toFixed(3)}" fill="none" stroke="${LINE}" stroke-width="0.15" />`
      );
    }
  }

  const rowLabelEls: string[] = [];
  const colLabelEls: string[] = [];
  const labelFontSizeMM = 2;

  if (!rotated) {
    for (let r = 0; r < rows; r++) {
      const cy = marginTopMM + (r + 0.5) * drawRowPitch + labelFontSizeMM * 0.35;
      rowLabelEls.push(
        `<text x="${(marginLeftMM - 2).toFixed(3)}" y="${cy.toFixed(3)}" font-family="monospace" font-size="${labelFontSizeMM}" fill="${LABEL}" text-anchor="end">${rowLabels[r]}</text>`
      );
    }
    for (let c = 0; c < columns; c += colLabelEvery) {
      const cx = marginLeftMM + (c + 0.5) * drawColPitch;
      colLabelEls.push(
        `<text x="${cx.toFixed(3)}" y="${(marginTopMM - 2).toFixed(3)}" font-family="monospace" font-size="${labelFontSizeMM}" fill="${LABEL}" text-anchor="middle">${c + 1}</text>`
      );
    }
  } else {
    for (let r = 0; r < rows; r++) {
      const cx = marginLeftMM + (r + 0.5) * drawColPitch;
      rowLabelEls.push(
        `<text x="${cx.toFixed(3)}" y="${(marginTopMM - 2).toFixed(3)}" font-family="monospace" font-size="${labelFontSizeMM}" fill="${LABEL}" text-anchor="middle">${rowLabels[r]}</text>`
      );
    }
    for (let c = 0; c < columns; c += colLabelEvery) {
      const cy = marginTopMM + (c + 0.5) * drawRowPitch + labelFontSizeMM * 0.35;
      colLabelEls.push(
        `<text x="${(marginLeftMM - 2).toFixed(3)}" y="${cy.toFixed(3)}" font-family="monospace" font-size="${labelFontSizeMM}" fill="${LABEL}" text-anchor="end">${c + 1}</text>`
      );
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${widthMM.toFixed(2)}mm" height="${heightMM.toFixed(2)}mm" viewBox="0 0 ${widthMM.toFixed(2)} ${heightMM.toFixed(2)}">
<rect width="${widthMM.toFixed(2)}" height="${heightMM.toFixed(2)}" fill="${PAPER}" />
${colLabelEls.join("")}
${rowLabelEls.join("")}
${gridLines.join("")}
${holes.join("")}
</svg>`;
}

/**
 * A small fixed swatch (4x4 holes) at the given pitch, meant to be printed
 * at 100%/actual size and held against a real blank card or the machine's
 * needle bed to confirm the pitch is correct before committing to a full
 * pattern. This exists because column/row pitch varies enough between
 * card brands and machine gauges that no single hardcoded number can be
 * trusted blind — verifying once against the real hardware is safer than
 * assuming a spec.
 */
export function generateCalibrationSwatchSVG(columnPitchMM: number, rowPitchMM: number): string {
  const cols = 4;
  const rows = 4;
  const margin = 10;
  const holeRadius = (Math.min(columnPitchMM, rowPitchMM) * 0.55) / 2;
  const widthMM = margin * 2 + cols * columnPitchMM;
  const heightMM = margin * 2 + rows * rowPitchMM;

  const holes: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = margin + (c + 0.5) * columnPitchMM;
      const cy = margin + (r + 0.5) * rowPitchMM;
      holes.push(`<circle cx="${cx.toFixed(3)}" cy="${cy.toFixed(3)}" r="${holeRadius.toFixed(3)}" fill="${WISTERIA}" />`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${widthMM.toFixed(2)}mm" height="${heightMM.toFixed(2)}mm" viewBox="0 0 ${widthMM.toFixed(2)} ${heightMM.toFixed(2)}">
<rect width="${widthMM.toFixed(2)}" height="${heightMM.toFixed(2)}" fill="${PAPER}" />
<text x="${(widthMM / 2).toFixed(2)}" y="${(margin * 0.6).toFixed(2)}" font-family="monospace" font-size="2.4" fill="${LABEL}" text-anchor="middle">print at 100% — hold against your card</text>
${holes.join("")}
</svg>`;
}

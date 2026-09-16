export type CardFormatId = "knit24" | "ibm80";
export type Orientation = "normal" | "rotated";

export interface CardFormat {
  id: CardFormatId;
  label: string;
  columns: number;
  /** null = user-adjustable row count (knitting cards repeat indefinitely); a number = fixed (IBM's 12 punch rows) */
  fixedRows: number | null;
  encoding: "bitmap" | "hollerith";
  rowLabels?: string[];
}

// Standard 24-stitch punch card system, shared across brother, silver reed/
// studio, toyota, and knitking machines with compatible card slots — cards
// are largely interchangeable between brands (lace cards being the main
// exception). Two facts genuinely differ by brand, so these are defaults
// to verify against your own machine, not universal constants:
// reader offset (brother/knitking: 7 rows below the visible row; silver
// reed/studio: 5 rows) and minimum rows to roll continuously (varies by
// model, commonly 30-36).
export const KNIT_COLUMNS = 24;
export const KNIT_DEFAULT_MIN_ROWS_TO_ROLL = 36;
export const KNIT_DEFAULT_READER_OFFSET = 7;

// Standard gauge needle pitch — the one number that's genuinely load-bearing
// for a to-scale card, since each column has to align with a needle
// position. Confirmed: 4.5mm between needles on standard gauge machines.
export const KNIT_DEFAULT_COLUMN_PITCH_MM = 4.5;
// Row (vertical) pitch isn't something a public spec confirmed — defaulting
// to match column pitch (square cells) and relying on the calibration
// swatch to verify against a real card rather than asserting an unverified number.
export const KNIT_DEFAULT_ROW_PITCH_MM = 4.5;

// Standard IBM Hollerith punch card: 80 columns, 12 rows (zone rows 12/11/0, digit rows 1-9)
export const IBM_COLUMNS = 80;
export const IBM_ROWS = 12;
export const IBM_ROW_LABELS = ["12", "11", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export const CARD_FORMATS: Record<CardFormatId, CardFormat> = {
  knit24: {
    id: "knit24",
    label: "knitting machine (24-stitch)",
    columns: KNIT_COLUMNS,
    fixedRows: null,
    encoding: "bitmap",
  },
  ibm80: {
    id: "ibm80",
    label: "IBM 80-column (hollerith)",
    columns: IBM_COLUMNS,
    fixedRows: IBM_ROWS,
    encoding: "hollerith",
    rowLabels: IBM_ROW_LABELS,
  },
};

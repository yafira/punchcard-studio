import type React from "react";
import { encodeText } from "@/lib/hollerith";
import { IBM_COLUMNS, IBM_ROWS, IBM_ROW_LABELS } from "@/lib/cardformats";

// a real 80-column hollerith card with the studio's name punched into it,
// using the same encoder as the text tab
const MESSAGE = "PUNCH CARD STUDIO";

// card proportions follow the real 7.375in x 3.25in card
const W = 737.5;
const H = 325;
const CORNER = 28;
const PAD_X = 22;
const PAD_TOP = 34;
const PAD_BOTTOM = 22;
const COL_W = (W - PAD_X * 2) / IBM_COLUMNS;
const ROW_H = (H - PAD_TOP - PAD_BOTTOM) / IBM_ROWS;
const HOLE_W = COL_W * 0.55;
const HOLE_H = ROW_H * 0.62;

export default function HeroCard() {
  const { cells } = encodeText(MESSAGE, IBM_COLUMNS);

  const printed: React.ReactElement[] = [];
  const holes: React.ReactElement[] = [];

  for (let r = 0; r < IBM_ROWS; r++) {
    const label = IBM_ROW_LABELS[r];
    // only the digit rows (0-9) carry printed numbers on a real card
    const printsDigit = label !== "12" && label !== "11";
    for (let c = 0; c < IBM_COLUMNS; c++) {
      const cx = PAD_X + c * COL_W + COL_W / 2;
      const cy = PAD_TOP + r * ROW_H + ROW_H / 2;
      if (cells[r * IBM_COLUMNS + c] === 0) {
        holes.push(
          <rect
            key={`h${r}-${c}`}
            x={cx - HOLE_W / 2}
            y={cy - HOLE_H / 2}
            width={HOLE_W}
            height={HOLE_H}
            rx={1.2}
            fill="var(--ink)"
          />
        );
      } else if (printsDigit) {
        printed.push(
          <text key={`p${r}-${c}`} x={cx} y={cy + 2.6} textAnchor="middle" fontSize={7.2}>
            {label}
          </text>
        );
      }
    }
  }

  // printed characters along the top edge, like a keypunch interprets the card
  const interpreted = MESSAGE.split("").map((ch, c) => (
    <text
      key={`i${c}`}
      x={PAD_X + c * COL_W + COL_W / 2}
      y={22}
      textAnchor="middle"
      fontSize={10}
      fontWeight={500}
      fill="var(--ink)"
    >
      {ch}
    </text>
  ));

  const outline = `M ${CORNER} 0 H ${W - 14} Q ${W} 0 ${W} 14 V ${H - 14} Q ${W} ${H} ${W - 14} ${H} H 14 Q 0 ${H} 0 ${H - 14} V ${CORNER} Z`;

  return (
    <div className="hero-card" aria-hidden="true">
      <svg viewBox={`-12 -12 ${W + 30} ${H + 30}`}>
        {/* offset shadow in blush, same bold-but-soft treatment as the pills */}
        <path d={outline} transform="translate(12 12)" fill="var(--blush)" />
        <path d={outline} fill="var(--butter-soft)" stroke="var(--ink)" strokeWidth={2.5} />
        <g fontFamily="var(--font-mono), monospace" fill="var(--wisteria)" opacity={0.55}>
          {printed}
        </g>
        <g fontFamily="var(--font-mono), monospace">{interpreted}</g>
        {holes}
      </svg>
    </div>
  );
}

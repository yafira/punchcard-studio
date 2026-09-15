"use client";

import { useEffect, useRef } from "react";
import { generatePunchCardSVG } from "@/lib/punchcard";
import { CardFormat, Orientation } from "@/lib/cardformats";
import { MachineSettingsValue } from "@/components/MachineSettings";

export default function PunchCardPreview({
  cells,
  format,
  rows,
  orientation,
  machineSettings,
}: {
  cells: Uint8Array;
  format: CardFormat;
  rows: number;
  orientation: Orientation;
  /** only meaningful for the knitting format; the hollerith format uses fixed internal defaults */
  machineSettings: MachineSettingsValue;
}) {
  const previewRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<string>("");

  const columnPitchMM = format.id === "knit24" ? machineSettings.columnPitchMM : 3;
  const rowPitchMM = format.id === "knit24" ? machineSettings.rowPitchMM : 3;

  useEffect(() => {
    const svg = generatePunchCardSVG(cells, format.columns, rows, {
      rowLabels: format.rowLabels,
      orientation,
      columnPitchMM,
      rowPitchMM,
    });
    svgRef.current = svg;
    if (previewRef.current) {
      previewRef.current.innerHTML = svg.replace("<svg ", '<svg style="width:100%;height:auto" ');
    }
  }, [cells, format, rows, orientation, columnPitchMM, rowPitchMM]);

  function handleDownload() {
    const blob = new Blob([svgRef.current], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "punchcard.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  const belowMinRows = format.id === "knit24" && rows < machineSettings.minRowsToRoll;
  const widthMM = format.columns * columnPitchMM;
  const heightMM = rows * rowPitchMM;

  return (
    <div>
      <div
        style={{
          background: "var(--wisteria-soft)",
          borderRadius: "var(--radius-md)",
          padding: 20,
          minHeight: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div ref={previewRef} style={{ width: "100%", maxWidth: 480, margin: "0 auto" }} />
      </div>

      <div
        className="mono"
        style={{
          marginTop: 14,
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--ink)",
          opacity: belowMinRows ? 1 : 0.7,
        }}
      >
        <span>
          {format.columns} × {rows} · {widthMM.toFixed(1)} × {heightMM.toFixed(1)} mm
          {belowMinRows ? ` — below the ${machineSettings.minRowsToRoll}-row minimum to roll continuously` : ""}
        </span>
        {format.id === "knit24" && (
          <span>{rows >= machineSettings.minRowsToRoll ? "rolls continuously" : "single card only"}</span>
        )}
      </div>

      {format.id === "knit24" && (
        <div className="mono" style={{ fontSize: 11, color: "var(--ink)", opacity: 0.6, marginTop: 10, lineHeight: 1.6 }}>
          reader offset: line up row 1 {machineSettings.readerOffset} rows below what's visible at the
          front of the machine.
        </div>
      )}

      <div
        className="mono"
        style={{
          fontSize: 11,
          color: "var(--ink)",
          background: "var(--butter-soft)",
          border: "2px dashed var(--butter)",
          borderRadius: "var(--radius-sm)",
          padding: "10px 14px",
          marginTop: 14,
          lineHeight: 1.6,
        }}
      >
        to print: open the downloaded SVG and print at 100% / actual size —
        disable "fit to page" or "scale to fit," or the pitch will be wrong.
        for reliable results, importing into craft-cutter software (silhouette
        studio, cricut design space) and cutting the holes will be far more
        precise than hand-punching from a printout.
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          className="display"
          onClick={handleDownload}
          style={{
            fontSize: 14,
            fontWeight: 600,
            padding: "14px 26px",
            background: "var(--wisteria)",
            color: "var(--paper)",
            border: "none",
            borderRadius: "var(--radius-pill)",
            cursor: "pointer",
          }}
        >
          download punch card svg
        </button>
      </div>
    </div>
  );
}

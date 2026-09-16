"use client";

import { useState } from "react";
import { makeBlankGrid, resizeGridRows } from "@/lib/punchcard";
import {
  CARD_FORMATS,
  CardFormatId,
  KNIT_DEFAULT_COLUMN_PITCH_MM,
  KNIT_DEFAULT_MIN_ROWS_TO_ROLL,
  KNIT_DEFAULT_READER_OFFSET,
  KNIT_DEFAULT_ROW_PITCH_MM,
  Orientation,
} from "@/lib/cardformats";
import ImageMode from "@/components/ImageMode";
import EditorMode, { EditorGrid } from "@/components/EditorMode";
import GenerativeMode from "@/components/GenerativeMode";
import TextMode from "@/components/TextMode";
import PunchCardPreview from "@/components/PunchCardPreview";
import MachineSettings, { MachineSettingsValue } from "@/components/MachineSettings";

type BitmapMode = "image" | "editor" | "generative";
type HollerithMode = "text" | "editor" | "generative";

const DEFAULT_KNIT_ROWS = 48;

export default function Workspace() {
  const [formatId, setFormatId] = useState<CardFormatId>("knit24");
  const [orientation, setOrientation] = useState<Orientation>("normal");
  const [knitRows, setKnitRows] = useState(DEFAULT_KNIT_ROWS);
  const [bitmapMode, setBitmapMode] = useState<BitmapMode>("generative");
  const [hollerithMode, setHollerithMode] = useState<HollerithMode>("text");
  const [machineSettings, setMachineSettings] = useState<MachineSettingsValue>({
    columnPitchMM: KNIT_DEFAULT_COLUMN_PITCH_MM,
    rowPitchMM: KNIT_DEFAULT_ROW_PITCH_MM,
    readerOffset: KNIT_DEFAULT_READER_OFFSET,
    minRowsToRoll: KNIT_DEFAULT_MIN_ROWS_TO_ROLL,
  });

  const format = CARD_FORMATS[formatId];
  const rows = format.fixedRows ?? knitRows;

  const [cells, setCells] = useState<Uint8Array>(() => makeBlankGrid(format.columns, rows));

  function handleFormatChange(nextId: CardFormatId) {
    const nextFormat = CARD_FORMATS[nextId];
    const nextRows = nextFormat.fixedRows ?? knitRows;
    setFormatId(nextId);
    setCells(makeBlankGrid(nextFormat.columns, nextRows));
  }

  function handleRowsChange(newRows: number) {
    setCells((prev) => resizeGridRows(prev, format.columns, rows, newRows));
    setKnitRows(newRows);
  }

  const mode = format.encoding === "bitmap" ? bitmapMode : hollerithMode;

  function setMode(next: BitmapMode | HollerithMode) {
    if (format.encoding === "bitmap") setBitmapMode(next as BitmapMode);
    else setHollerithMode(next as HollerithMode);
  }

  return (
    <main style={{ padding: "0 28px 80px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>
        <PillGroup label="card format">
          {(Object.keys(CARD_FORMATS) as CardFormatId[]).map((id) => (
            <PillButton key={id} active={formatId === id} onClick={() => handleFormatChange(id)} accent="wisteria">
              {CARD_FORMATS[id].label}
            </PillButton>
          ))}
        </PillGroup>

        <PillGroup label="orientation">
          <PillButton active={orientation === "normal"} onClick={() => setOrientation("normal")} accent="matcha">
            normal
          </PillButton>
          <PillButton active={orientation === "rotated"} onClick={() => setOrientation("rotated")} accent="matcha">
            rotated
          </PillButton>
        </PillGroup>
      </div>

      {format.id === "knit24" && <MachineSettings value={machineSettings} onChange={setMachineSettings} />}

      {format.fixedRows === null && (
        <div
          style={{
            padding: 20,
            marginBottom: 28,
            background: "var(--matcha-soft)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span className="mono" style={{ fontSize: 11, color: "var(--ink)", opacity: 0.7, marginBottom: 10, display: "block" }}>
            rows — shared across image/draw/generate for this format
          </span>
          <input
            type="range"
            min={12}
            max={96}
            step={1}
            value={knitRows}
            onChange={(e) => handleRowsChange(parseInt(e.target.value, 10))}
            style={{ width: "100%", maxWidth: 400, accentColor: "var(--matcha)" }}
          />
          <div className="mono" style={{ fontSize: 11, color: "var(--ink)", opacity: 0.8, marginTop: 8 }}>
            {knitRows} rows
            {knitRows < machineSettings.minRowsToRoll ? ` — below the ${machineSettings.minRowsToRoll}-row minimum to roll continuously` : ""}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {format.encoding === "bitmap" ? (
          <>
            <TabButton active={mode === "image"} onClick={() => setMode("image")}>image</TabButton>
            <TabButton active={mode === "editor"} onClick={() => setMode("editor")}>draw</TabButton>
            <TabButton active={mode === "generative"} onClick={() => setMode("generative")}>generate</TabButton>
          </>
        ) : (
          <>
            <TabButton active={mode === "text"} onClick={() => setMode("text")}>text</TabButton>
            <TabButton active={mode === "editor"} onClick={() => setMode("editor")}>draw</TabButton>
            <TabButton active={mode === "generative"} onClick={() => setMode("generative")}>generate</TabButton>
          </>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 32 }}>
        {format.encoding === "bitmap" && mode === "image" && (
          <ImageMode columns={format.columns} rows={rows} onGridChange={setCells} />
        )}
        {mode === "editor" && <EditorMode columns={format.columns} rows={rows} onGridChange={setCells} />}
        {mode === "generative" && <GenerativeMode columns={format.columns} rows={rows} onGridChange={setCells} />}
        {format.encoding === "hollerith" && mode === "text" && (
          <TextMode columns={format.columns} onGridChange={setCells} />
        )}

        <div>
          {mode === "editor" && (
            <div style={{ marginBottom: 24 }}>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink)", opacity: 0.6, marginBottom: 10 }}>
                click or drag to punch/unpunch
              </div>
              <EditorGrid cells={cells} columns={format.columns} rows={rows} onGridChange={setCells} />
            </div>
          )}
          <PunchCardPreview cells={cells} format={format} rows={rows} orientation={orientation} machineSettings={machineSettings} />
        </div>
      </div>
    </main>
  );
}

function PillGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mono" style={{ fontSize: 11, color: "var(--ink)", opacity: 0.6, marginBottom: 8, display: "block" }}>
        {label}
      </span>
      <div style={{ display: "flex", gap: 8 }}>{children}</div>
    </div>
  );
}

function PillButton({
  active,
  onClick,
  children,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  accent: "wisteria" | "matcha" | "blush" | "butter";
}) {
  return (
    <button
      className="mono"
      onClick={onClick}
      style={{
        padding: "10px 18px",
        fontSize: 12,
        borderRadius: "var(--radius-pill)",
        background: active ? `var(--${accent})` : "var(--paper)",
        color: active ? "var(--paper)" : "var(--ink)",
        border: `2px solid var(--${accent})`,
        cursor: "pointer",
        transition: "background 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      className="display"
      onClick={onClick}
      style={{
        padding: "12px 22px",
        fontSize: 14,
        fontWeight: 600,
        borderRadius: "var(--radius-md)",
        background: active ? "var(--blush)" : "var(--blush-soft)",
        color: active ? "var(--paper)" : "var(--ink)",
        border: "none",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

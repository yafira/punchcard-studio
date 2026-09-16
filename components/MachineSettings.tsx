"use client";

import { generateCalibrationSwatchSVG } from "@/lib/punchcard";

export interface MachineSettingsValue {
  columnPitchMM: number;
  rowPitchMM: number;
  readerOffset: number;
  minRowsToRoll: number;
}

export default function MachineSettings({
  value,
  onChange,
}: {
  value: MachineSettingsValue;
  onChange: (next: MachineSettingsValue) => void;
}) {
  function update(patch: Partial<MachineSettingsValue>) {
    onChange({ ...value, ...patch });
  }

  function downloadCalibrationSwatch() {
    const svg = generateCalibrationSwatchSVG(value.columnPitchMM, value.rowPitchMM);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "punchcard-calibration-swatch.svg";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div
      style={{
        background: "var(--butter-soft)",
        border: "2.5px dashed var(--butter)",
        borderRadius: "var(--radius-md)",
        padding: 20,
        marginBottom: 28,
      }}
    >
      <div className="display" style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
        machine settings
      </div>
      <div className="mono" style={{ fontSize: 11, color: "var(--ink)", opacity: 0.7, marginBottom: 16, lineHeight: 1.6 }}>
        these vary by machine brand — the defaults are a documented starting point,
        not a universal spec. print the calibration swatch at 100% and check it against
        your own card or needle bed before punching a full pattern.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 16 }}>
        <Field label="column pitch (mm)" hint="needle spacing — 4.5mm is standard gauge">
          <input
            type="number"
            min={1}
            max={20}
            step={0.1}
            value={value.columnPitchMM}
            onChange={(e) => update({ columnPitchMM: parseFloat(e.target.value) || value.columnPitchMM })}
            style={inputStyle}
          />
        </Field>
        <Field label="row pitch (mm)" hint="not independently confirmed — verify with the swatch">
          <input
            type="number"
            min={1}
            max={20}
            step={0.1}
            value={value.rowPitchMM}
            onChange={(e) => update({ rowPitchMM: parseFloat(e.target.value) || value.rowPitchMM })}
            style={inputStyle}
          />
        </Field>
        <Field label="reader offset (rows)" hint="brother/knitking: 7 · silver reed/studio: 5">
          <input
            type="number"
            min={0}
            max={20}
            step={1}
            value={value.readerOffset}
            onChange={(e) => update({ readerOffset: parseInt(e.target.value, 10) || 0 })}
            style={inputStyle}
          />
        </Field>
        <Field label="min rows to roll" hint="commonly 30–36, varies by model">
          <input
            type="number"
            min={1}
            max={100}
            step={1}
            value={value.minRowsToRoll}
            onChange={(e) => update({ minRowsToRoll: parseInt(e.target.value, 10) || value.minRowsToRoll })}
            style={inputStyle}
          />
        </Field>
      </div>

      <button
        className="mono"
        onClick={downloadCalibrationSwatch}
        style={{
          fontSize: 12,
          padding: "10px 18px",
          background: "var(--paper)",
          color: "var(--ink)",
          border: "2px solid var(--butter)",
          borderRadius: "var(--radius-pill)",
          cursor: "pointer",
        }}
      >
        download calibration swatch
      </button>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mono" style={{ fontSize: 11, color: "var(--ink)", marginBottom: 4, display: "block" }}>
        {label}
      </span>
      {children}
      <div className="mono" style={{ fontSize: 10, color: "var(--ink)", opacity: 0.6, marginTop: 4 }}>
        {hint}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 13,
  background: "var(--paper)",
  border: "2px solid var(--butter)",
  borderRadius: "var(--radius-sm)",
  padding: "6px 8px",
};

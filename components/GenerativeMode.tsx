"use client";

import { useCallback, useEffect, useState } from "react";
import { generatePattern, GenerativeAlgorithm } from "@/lib/generative";

const ALGO_LABELS: Record<GenerativeAlgorithm, string> = {
  stripes: "stripes",
  checkerboard: "checkerboard",
  noise: "noise",
  automaton: "cellular automaton",
};

export default function GenerativeMode({
  columns,
  rows,
  onGridChange,
}: {
  columns: number;
  rows: number;
  onGridChange: (cells: Uint8Array) => void;
}) {
  const [algorithm, setAlgorithm] = useState<GenerativeAlgorithm>("automaton");
  const [seed, setSeed] = useState(1);
  const [scale, setScale] = useState(2);
  const [density, setDensity] = useState(0.4);
  const [rule, setRule] = useState(90);

  const apply = useCallback(() => {
    const cells = generatePattern(columns, rows, { algorithm, seed, scale, density, rule });
    onGridChange(cells);
  }, [algorithm, seed, scale, density, rule, columns, rows, onGridChange]);

  useEffect(() => {
    apply();
  }, [apply]);

  return (
    <div style={{ background: "var(--matcha-soft)", borderRadius: "var(--radius-md)", padding: 20 }}>
      <Step tag="pattern">
        <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value as GenerativeAlgorithm)} style={selectStyle}>
          {(Object.keys(ALGO_LABELS) as GenerativeAlgorithm[]).map((key) => (
            <option key={key} value={key}>
              {ALGO_LABELS[key]}
            </option>
          ))}
        </select>
      </Step>

      {(algorithm === "stripes" || algorithm === "checkerboard") && (
        <Step tag="scale">
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={scale}
            onChange={(e) => setScale(parseInt(e.target.value, 10))}
            style={{ width: "100%", accentColor: "var(--matcha)" }}
          />
          <div className="mono" style={readout}>
            {scale} cells
          </div>
        </Step>
      )}

      {algorithm === "noise" && (
        <>
          <Step tag="density">
            <input
              type="range"
              min={0.05}
              max={0.95}
              step={0.05}
              value={density}
              onChange={(e) => setDensity(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "var(--matcha)" }}
            />
            <div className="mono" style={readout}>
              {Math.round(density * 100)}% punched
            </div>
          </Step>
          <Step tag="seed">
            <button className="mono" style={secondaryBtn} onClick={() => setSeed((s) => s + 1)}>
              new seed ({seed})
            </button>
          </Step>
        </>
      )}

      {algorithm === "automaton" && (
        <Step tag="rule">
          <input
            type="number"
            min={0}
            max={255}
            step={1}
            value={rule}
            onChange={(e) => setRule(Math.max(0, Math.min(255, parseInt(e.target.value, 10) || 0)))}
            style={selectStyle}
          />
          <div className="mono" style={readout}>
            wolfram elementary CA rule, 0–255. try 30, 90, or 110.
          </div>
        </Step>
      )}
    </div>
  );
}

function Step({ tag, children }: { tag: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <span className="mono" style={{ fontSize: 11, color: "var(--ink)", opacity: 0.6, marginBottom: 8, display: "block" }}>
        {tag}
      </span>
      {children}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  fontSize: 13,
  background: "var(--paper)",
  border: "2px solid var(--matcha)",
  borderRadius: "var(--radius-sm)",
  padding: 8,
};

const readout: React.CSSProperties = {
  fontSize: 11,
  color: "var(--ink)",
  opacity: 0.7,
  marginTop: 8,
};

const secondaryBtn: React.CSSProperties = {
  fontSize: 12,
  padding: "10px 16px",
  background: "var(--paper)",
  color: "var(--ink)",
  border: "2px solid var(--matcha)",
  borderRadius: "var(--radius-pill)",
  cursor: "pointer",
};

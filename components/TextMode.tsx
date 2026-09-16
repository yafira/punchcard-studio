"use client";

import { useCallback, useEffect, useState } from "react";
import { encodeText } from "@/lib/hollerith";

export default function TextMode({
  columns,
  onGridChange,
}: {
  columns: number;
  onGridChange: (cells: Uint8Array) => void;
}) {
  const [text, setText] = useState("TIMESHEET 07 22 26");
  const [unsupported, setUnsupported] = useState<string[]>([]);

  const apply = useCallback(() => {
    const result = encodeText(text, columns);
    setUnsupported(result.unsupported);
    onGridChange(result.cells);
  }, [text, columns, onGridChange]);

  useEffect(() => {
    apply();
  }, [apply]);

  return (
    <div style={{ background: "var(--matcha-soft)", borderRadius: "var(--radius-md)", padding: 20 }}>
      <span className="mono" style={{ fontSize: 11, color: "var(--ink)", opacity: 0.6, marginBottom: 10, display: "block" }}>
        text, one line
      </span>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, columns))}
        rows={3}
        style={{
          width: "100%",
          fontSize: 13,
          fontFamily: "var(--font-mono), monospace",
          background: "var(--paper)",
          border: "2px solid var(--matcha)",
          borderRadius: "var(--radius-sm)",
          padding: 8,
          resize: "vertical",
        }}
      />
      <div className="mono" style={{ fontSize: 11, color: "var(--ink)", opacity: 0.7, marginTop: 8 }}>
        {text.length} / {columns} columns used
      </div>

      <div className="mono" style={{ fontSize: 11, color: "var(--ink)", opacity: 0.7, marginTop: 18, lineHeight: 1.6 }}>
        real IBM hollerith code: digits punch one row, letters punch a zone row
        (12 for A–I, 11 for J–R, 0 for S–Z) plus a digit row. covers uppercase
        letters, digits, and spaces — the full 029 punctuation/symbol set isn't
        implemented, so anything outside that comes through blank.
      </div>

      {unsupported.length > 0 && (
        <div
          className="mono"
          style={{
            fontSize: 11,
            color: "var(--ink)",
            background: "var(--butter-soft)",
            border: "2px dashed var(--butter)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 12px",
            marginTop: 12,
            lineHeight: 1.6,
          }}
        >
          not encoded, left blank: {unsupported.join(" ")}
        </div>
      )}
    </div>
  );
}

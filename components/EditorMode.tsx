"use client";

import { useEffect, useRef, useState } from "react";

export default function EditorMode({
  columns,
  rows,
  onGridChange,
}: {
  columns: number;
  rows: number;
  onGridChange: (cells: Uint8Array) => void;
}) {
  function clearAll() {
    onGridChange(new Uint8Array(columns * rows).fill(1));
  }

  return (
    <div style={{ background: "var(--wisteria-soft)", borderRadius: "var(--radius-md)", padding: 20 }}>
      <span className="mono" style={{ fontSize: 11, color: "var(--ink)", opacity: 0.7, marginBottom: 10, display: "block" }}>
        draw directly
      </span>
      <div className="mono" style={{ fontSize: 11, color: "var(--ink)", opacity: 0.8, lineHeight: 1.6 }}>
        click or drag across the grid to punch/unpunch cells by hand.
      </div>

      <div style={{ marginTop: 20 }}>
        <button
          className="mono"
          onClick={clearAll}
          style={{
            fontSize: 12,
            padding: "10px 18px",
            background: "var(--paper)",
            color: "var(--ink)",
            border: "2px solid var(--wisteria)",
            borderRadius: "var(--radius-pill)",
            cursor: "pointer",
          }}
        >
          clear grid
        </button>
      </div>
    </div>
  );
}

/**
 * The actual clickable/draggable grid. Rendered separately from EditorMode's
 * sidebar controls so Workspace can place it full-width in the preview
 * column, matching how ImageMode/GenerativeMode hand off to PunchCardPreview.
 */
export function EditorGrid({
  cells,
  columns,
  rows,
  onGridChange,
}: {
  cells: Uint8Array;
  columns: number;
  rows: number;
  onGridChange: (cells: Uint8Array) => void;
}) {
  const [isPointerDown, setIsPointerDown] = useState(false);
  const paintValueRef = useRef<0 | 1>(0);

  useEffect(() => {
    function stop() {
      setIsPointerDown(false);
    }
    window.addEventListener("pointerup", stop);
    return () => window.removeEventListener("pointerup", stop);
  }, []);

  function setCell(index: number, value: 0 | 1) {
    if (cells[index] === value) return;
    const next = new Uint8Array(cells);
    next[index] = value;
    onGridChange(next);
  }

  function startPaint(index: number) {
    const newValue: 0 | 1 = cells[index] === 0 ? 1 : 0;
    paintValueRef.current = newValue;
    setIsPointerDown(true);
    setCell(index, newValue);
  }

  function continuePaint(index: number) {
    if (!isPointerDown) return;
    setCell(index, paintValueRef.current);
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 2,
        background: "var(--paper)",
        border: "2.5px dashed var(--ink)",
        borderRadius: "var(--radius-md)",
        padding: 10,
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {Array.from({ length: columns * rows }).map((_, i) => {
        const punched = cells[i] === 0;
        return (
          <div
            key={i}
            onPointerDown={() => startPaint(i)}
            onPointerEnter={() => continuePaint(i)}
            style={{
              aspectRatio: "1 / 1",
              background: punched ? "var(--wisteria)" : "var(--wisteria-soft)",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          />
        );
      })}
    </div>
  );
}

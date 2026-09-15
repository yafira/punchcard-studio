"use client";

import { useCallback, useEffect, useState } from "react";
import { dither, Algorithm } from "@/lib/dither";

export default function ImageMode({
  columns,
  rows,
  onGridChange,
}: {
  columns: number;
  rows: number;
  onGridChange: (cells: Uint8Array) => void;
}) {
  const [sourceImg, setSourceImg] = useState<HTMLImageElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [algorithm, setAlgorithm] = useState<Algorithm>("threshold");
  const [exposure, setExposure] = useState(0);

  const apply = useCallback(() => {
    if (!sourceImg) return;
    const naturalW = sourceImg.naturalWidth || sourceImg.width;
    const naturalH = sourceImg.naturalHeight || sourceImg.height;

    const small = document.createElement("canvas");
    small.width = columns;
    small.height = rows;
    const sctx = small.getContext("2d")!;
    sctx.drawImage(sourceImg, 0, 0, naturalW, naturalH, 0, 0, columns, rows);
    const imageData = sctx.getImageData(0, 0, columns, rows);

    const result = dither(imageData, { algorithm, exposure });
    onGridChange(result.cells);
  }, [sourceImg, algorithm, exposure, columns, rows, onGridChange]);

  useEffect(() => {
    apply();
  }, [apply]);

  function loadFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => setSourceImg(img);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ background: "var(--matcha-soft)", borderRadius: "var(--radius-md)", padding: 20 }}>
      <Step tag="algorithm">
        <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value as Algorithm)} style={selectStyle}>
          <option value="threshold">threshold</option>
          <option value="bayer">ordered (bayer 4×4)</option>
          <option value="floyd">floyd–steinberg</option>
          <option value="atkinson">atkinson</option>
        </select>
      </Step>

      <Step tag="exposure">
        <input
          type="range"
          min={-80}
          max={80}
          step={1}
          value={exposure}
          onChange={(e) => setExposure(parseInt(e.target.value, 10))}
          style={{ width: "100%", accentColor: "var(--matcha)" }}
        />
        <div className="mono" style={readout}>
          exposure {exposure > 0 ? "+" : ""}
          {exposure}
        </div>
      </Step>

      <label
        className="mono"
        style={{
          display: "block",
          border: `2.5px dashed ${dragging ? "var(--matcha)" : "var(--ink)"}`,
          borderRadius: "var(--radius-md)",
          background: "var(--paper)",
          padding: 18,
          textAlign: "center",
          fontSize: 11,
          color: "var(--ink)",
          opacity: dragging ? 1 : 0.75,
          cursor: "pointer",
          marginTop: 16,
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length) loadFile(e.dataTransfer.files[0]);
        }}
      >
        drop an image here
        <br />
        or click to browse
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files?.length) loadFile(e.target.files[0]);
          }}
        />
      </label>

      {!sourceImg && (
        <div className="mono" style={{ fontSize: 11, color: "var(--ink)", opacity: 0.6, marginTop: 12 }}>
          the grid stays blank until you drop a photo in.
        </div>
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

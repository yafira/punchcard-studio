import Workspace from "@/components/Workspace";
import HeroCard from "@/components/HeroCard";

export default function Home() {
  return (
    <>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          padding: "20px 28px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div
          className="display"
          style={{
            fontSize: 16,
            fontWeight: 600,
            background: "var(--blush)",
            color: "var(--paper)",
            padding: "6px 16px",
            borderRadius: "var(--radius-pill)",
            whiteSpace: "nowrap",
          }}
        >
          ⚡ punch card studio
        </div>
        <nav className="mono" style={{ fontSize: 12, color: "var(--ink)", opacity: 0.6 }}>
          knitting + data-processing punch cards
        </nav>
      </header>

      <section className="hero">
        <div>
        <div
          className="mono"
          style={{
            display: "inline-block",
            fontSize: 11,
            color: "var(--ink)",
            background: "var(--butter-soft)",
            border: "2px dashed var(--butter)",
            padding: "4px 12px",
            borderRadius: "var(--radius-pill)",
            marginBottom: 20,
          }}
        >
          for knitting machines, and before them
        </div>
        <h1
          className="display"
          style={{
            fontSize: "clamp(34px, 5.5vw, 62px)",
            lineHeight: 1.08,
            fontWeight: 700,
            margin: "0 0 20px",
            color: "var(--ink)",
          }}
        >
          every punch card
          <br />
          is a <span style={{ color: "var(--wisteria)" }}>binary grid</span>.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--ink)", opacity: 0.8, maxWidth: 560, margin: 0 }}>
          two real formats: the 24-stitch card any compatible knitting machine
          reads, and the 80-column IBM hollerith card — the same punch-card logic
          IBM used for payroll and timesheets before it was ever used for
          knitting. dither a photo into either, draw one by hand, grow one from
          a rule, or type a line of text and watch it encode into real
          hollerith punches. rotate either format, and export the knitting
          format at true physical scale — with a calibration swatch to verify
          against your own machine before you punch anything for real.
        </p>
        </div>
        <HeroCard />
      </section>

      <Workspace />

      <footer
        className="mono"
        style={{
          padding: "24px 28px 40px",
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "var(--ink)",
          opacity: 0.5,
        }}
      >
        <span>punch card studio — concept 00</span>
        <span>2026</span>
      </footer>
    </>
  );
}

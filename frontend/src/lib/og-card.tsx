/**
 * Shared artwork for the Open Graph / Twitter share image. It is drawn with
 * flexbox only (the subset `next/og` supports), uses no external assets, and
 * makes no product claims beyond the page's own headline.
 */

const INK = "#111827";
const BODY = "#475569";
const MUTED = "#5B6779";
const PRIMARY = "#4F46E5";
const EVIDENCE = "#0F766E";
const LINE = "#E2E8F0";
const PAPER = "#F7F7F3";

function SourceCard({ label, width }: { label: string; width: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 16,
        width: 176,
        background: "#fff",
        border: `2px solid ${LINE}`,
        borderRadius: 16,
      }}
    >
      <div style={{ display: "flex", fontSize: 18, fontWeight: 600, color: MUTED }}>{label}</div>
      <div style={{ display: "flex", height: 12, width, background: LINE, borderRadius: 6 }} />
      <div style={{ display: "flex", height: 12, width: 90, background: LINE, borderRadius: 6 }} />
    </div>
  );
}

function Marker({ n }: { n: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        borderRadius: 8,
        border: "2px solid #99D5CF",
        background: "#ECF8F6",
        color: EVIDENCE,
        fontSize: 20,
        fontWeight: 700,
      }}
    >
      {n}
    </div>
  );
}

export function OgCard() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: PAPER,
        padding: 60,
        gap: 32,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: PRIMARY,
            }}
          >
            <svg width="36" height="36" viewBox="0 0 32 32">
              <path
                d="M5 10h7c3 0 4 2 4 6s1 6 4 6h7M5 16h22M5 22h7c3 0 4-2 4-6s1-6 4-6h7"
                fill="none"
                stroke="#fff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 38, fontWeight: 700, color: INK }}>PodFlow</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 60,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: -2,
              color: INK,
            }}
          >
            <span>Turn scattered sources into&nbsp;</span>
            <span style={{ color: PRIMARY }}>knowledge you can use.</span>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: BODY }}>
            A knowledge workspace for evidence-linked research
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 22, color: MUTED }}>
          Concept preview. In development.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <SourceCard label="Video" width={120} />
          <SourceCard label="Article" width={100} />
          <SourceCard label="Document" width={130} />
        </div>
        <div style={{ display: "flex", width: 22, height: 4, background: "#818CF8", borderRadius: 2 }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            flex: 1,
            padding: 22,
            background: "#fff",
            border: `2px solid ${LINE}`,
            borderRadius: 20,
          }}
        >
          <div style={{ display: "flex", width: 110, height: 24, borderRadius: 8, background: "#EEF2FF" }} />
          <div style={{ display: "flex", height: 20, width: 150, background: INK, borderRadius: 6 }} />
          <div style={{ display: "flex", height: 12, width: 176, background: LINE, borderRadius: 6 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", height: 12, width: 100, background: LINE, borderRadius: 6 }} />
            <Marker n="1" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", height: 12, width: 120, background: LINE, borderRadius: 6 }} />
            <Marker n="2" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", height: 12, width: 90, background: LINE, borderRadius: 6 }} />
            <Marker n="3" />
          </div>
        </div>
      </div>
    </div>
  );
}

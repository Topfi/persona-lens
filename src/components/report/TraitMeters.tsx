import type { AssessmentDoc } from "../../lib/schema/assessment";

export default function TraitMeters({ traits }: { traits: AssessmentDoc["traits"] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px 32px" }}>
      {traits.map((t) => (
        <div key={t.name} title={t.evidence}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
            <span style={{ fontSize: 14, color: "var(--text-0)" }}>{t.name}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)" }}>{Math.round(t.score)}</span>
          </div>
          <div style={{ height: 8, background: "var(--ink-2)", borderRadius: 4 }}>
            <div
              style={{
                width: `${t.score}%`,
                height: "100%",
                borderRadius: 4,
                background: "linear-gradient(90deg, var(--data), var(--accent-dim))",
              }}
            />
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "var(--muted)", lineHeight: 1.45 }}>{t.evidence}</p>
        </div>
      ))}
    </div>
  );
}

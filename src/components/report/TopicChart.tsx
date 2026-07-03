import type { AssessmentDoc } from "../../lib/schema/assessment";

/** Horizontal magnitude bars — single hue, direct labels, no legend needed. */
export default function TopicChart({ data }: { data: AssessmentDoc["topicDistribution"] }) {
  const sorted = [...data].sort((a, b) => b.weight - a.weight);
  const max = sorted[0]?.weight ?? 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {sorted.map((t) => (
        <div key={t.topic} style={{ display: "grid", gridTemplateColumns: "170px 1fr 52px", gap: 12, alignItems: "center" }} title={`${t.topic}: ${(t.weight * 100).toFixed(1)}%`}>
          <span style={{ fontSize: 13, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {t.topic}
          </span>
          <div style={{ height: 12, background: "var(--ink-2)", borderRadius: 6 }}>
            <div
              style={{
                width: `${Math.max(2, (t.weight / max) * 100)}%`,
                height: "100%",
                background: "var(--data)",
                borderRadius: 6,
                transition: "width 600ms cubic-bezier(0.22,1,0.36,1)",
              }}
            />
          </div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)", textAlign: "right" }}>
            {(t.weight * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}

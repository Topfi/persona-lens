import { useMemo } from "react";
import type { AssessmentDoc } from "../../lib/schema/assessment";

/**
 * Deterministic CSS tag cloud: font size and opacity scale with weight,
 * order shuffled by a seeded hash so heavy terms are dispersed rather than
 * front-loaded. No canvas, no layout physics.
 */
export default function WordCloud({ terms }: { terms: AssessmentDoc["wordCloud"] }) {
  const shuffled = useMemo(() => {
    const hash = (s: string) => {
      let h = 2166136261;
      for (const c of s) h = (h ^ c.charCodeAt(0)) * 16777619;
      return (h >>> 0) / 2 ** 32;
    };
    return [...terms].sort((a, b) => hash(a.term) - hash(b.term));
  }, [terms]);

  return (
    <p style={{ margin: 0, lineHeight: 1.9, textAlign: "center" }}>
      {shuffled.map(({ term, weight }, i) => (
        <span
          key={term}
          title={`weight ${(weight * 100).toFixed(0)}`}
          style={{
            fontSize: `${13 + weight * 24}px`,
            fontFamily: weight > 0.5 ? "var(--font-display)" : "var(--font-body)",
            fontWeight: weight > 0.5 ? 600 : 400,
            color: i % 5 === 0 ? "var(--accent)" : `color-mix(in oklab, var(--text-0) ${35 + weight * 65}%, var(--ink-0))`,
            margin: "0 10px",
            whiteSpace: "nowrap",
            display: "inline-block",
          }}
        >
          {term}
        </span>
      ))}
    </p>
  );
}

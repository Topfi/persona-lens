import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AssessmentDoc } from "../../lib/schema/assessment";

export default function ActivityChart({ data }: { data: AssessmentDoc["activityByMonth"] }) {
  if (data.length === 0) return null;
  const tickEvery = Math.max(1, Math.floor(data.length / 8));
  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -18, bottom: 0 }} barCategoryGap="18%">
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={{ stroke: "var(--ink-3)" }}
            interval={tickEvery - 1}
          />
          <YAxis
            tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={40}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            contentStyle={{
              background: "var(--ink-2)",
              border: "1px solid var(--ink-3)",
              borderRadius: 6,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--text-0)",
            }}
            labelStyle={{ color: "var(--text-1)" }}
            formatter={(value) => [`${value} items`, ""]}
          />
          {/* No mount animation: bars must render even when rAF is throttled. */}
          <Bar dataKey="count" fill="var(--data)" radius={[3, 3, 0, 0]} maxBarSize={22} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

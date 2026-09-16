"use client";

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export default function TrendLine({ data }: { data: { date: string; progress: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ left: -20, right: 12, top: 8, bottom: 0 }}>
        <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: "var(--ink-muted)", fontSize: 11 }} axisLine={{ stroke: "var(--line)" }} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fill: "var(--ink-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 6, fontSize: 12 }}
          formatter={(v: number) => [`${v}%`, "Progress"]}
        />
        <Line type="monotone" dataKey="progress" stroke="var(--brand-bright)" strokeWidth={2} dot={{ r: 3, fill: "var(--brand-bright)" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

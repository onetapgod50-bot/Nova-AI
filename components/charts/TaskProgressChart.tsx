"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

export default function TaskProgressChart({
  data,
}: {
  data: { name: string; progress: number; status: string }[];
}) {
  const colorForStatus = (status: string) =>
    status === "delayed"
      ? "var(--amber)"
      : status === "completed"
      ? "var(--brand)"
      : status === "in_progress" || status === "active"
      ? "var(--blueprint)"
      : "var(--line)";

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 38)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tick={{ fill: "var(--ink-muted)", fontSize: 12 }}
          axisLine={{ stroke: "var(--line)" }}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "var(--surface-2)" }}
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 6,
            fontSize: 12,
          }}
          formatter={(v: number) => [`${v}%`, "Progress"]}
        />
        <Bar dataKey="progress" radius={[0, 4, 4, 0]} barSize={14}>
          {data.map((d, i) => (
            <Cell key={i} fill={colorForStatus(d.status)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

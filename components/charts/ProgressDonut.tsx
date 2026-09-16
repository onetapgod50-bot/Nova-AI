"use client";

import { PieChart, Pie, Cell } from "recharts";

export default function ProgressDonut({ value, size = 120 }: { value: number; size?: number }) {
  const data = [
    { name: "done", value },
    { name: "remaining", value: 100 - value },
  ];
  return (
    <div style={{ width: size, height: size }} className="relative">
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={size / 2 - 14}
          outerRadius={size / 2}
          startAngle={90}
          endAngle={-270}
          stroke="none"
        >
          <Cell fill="var(--brand-bright)" />
          <Cell fill="var(--surface-2)" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-xl font-semibold text-ink">{value}%</span>
      </div>
    </div>
  );
}

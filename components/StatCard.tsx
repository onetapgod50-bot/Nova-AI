import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  accent = "brand",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "brand" | "amber" | "blueprint";
  hint?: string;
}) {
  const border =
    accent === "amber"
      ? "border-l-amber"
      : accent === "blueprint"
      ? "border-l-blueprint"
      : "border-l-brand";
  const iconColor =
    accent === "amber" ? "text-amber" : accent === "blueprint" ? "text-blueprint" : "text-brand";

  return (
    <div
      className={`rounded-md border border-line border-l-[3px] ${border} bg-surface p-4`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-inkmuted">{label}</div>
          <div className="mt-1.5 font-mono text-2xl font-semibold text-ink">{value}</div>
          {hint && <div className="mt-1 text-xs text-inkmuted">{hint}</div>}
        </div>
        <Icon size={18} className={iconColor} strokeWidth={1.75} />
      </div>
    </div>
  );
}

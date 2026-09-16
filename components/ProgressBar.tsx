export default function ProgressBar({
  value,
  size = "md",
  tone = "brand",
}: {
  value: number;
  size?: "sm" | "md";
  tone?: "brand" | "amber" | "blueprint";
}) {
  const height = size === "sm" ? "h-1.5" : "h-2";
  const color =
    tone === "amber" ? "bg-amber" : tone === "blueprint" ? "bg-blueprint" : "bg-brand";
  return (
    <div className={`w-full ${height} rounded-full bg-surface2 overflow-hidden`}>
      <div
        className={`${height} ${color} rounded-full transition-all`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

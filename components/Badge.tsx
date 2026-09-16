const STYLES: Record<string, string> = {
  // project status
  planning: "bg-surface2 text-inkmuted border-line",
  active: "bg-brand-soft text-brand border-brand/30",
  delayed: "bg-amber/10 text-amber border-amber/30",
  completed: "bg-brand-soft text-brand border-brand/30",
  // task status
  not_started: "bg-surface2 text-inkmuted border-line",
  in_progress: "bg-blueprint/10 text-blueprint border-blueprint/30",
  on_hold: "bg-surface2 text-inkmuted border-line",
  // request status
  pending: "bg-amber/10 text-amber border-amber/30",
  approved: "bg-brand-soft text-brand border-brand/30",
  rejected: "bg-clay/10 text-clay border-clay/30",
  modified: "bg-blueprint/10 text-blueprint border-blueprint/30",
  // priority
  high: "bg-clay/10 text-clay border-clay/30",
  medium: "bg-amber/10 text-amber border-amber/30",
  low: "bg-surface2 text-inkmuted border-line",
};

const LABELS: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  on_hold: "On hold",
};

export default function Badge({ value }: { value: string }) {
  const style = STYLES[value] || "bg-surface2 text-inkmuted border-line";
  const label = LABELS[value] || value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {label}
    </span>
  );
}

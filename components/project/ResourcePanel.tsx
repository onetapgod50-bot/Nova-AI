"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Boxes, Plus } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import type { Resource, Task } from "@/lib/types";

export default function ResourcePanel({
  projectId,
  tasks,
  resources,
}: {
  projectId: string;
  tasks: Task[];
  resources: Resource[];
}) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="rounded-md border border-line bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Boxes size={15} className="text-brand" /> Resource allocation
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink hover:border-brand hover:text-brand"
        >
          <Plus size={13} /> Allocate resource
        </button>
      </div>

      {showAdd && (
        <AddResourceForm
          projectId={projectId}
          tasks={tasks}
          onDone={() => {
            setShowAdd(false);
            router.refresh();
          }}
        />
      )}

      <div className="space-y-3">
        {resources.map((r) => {
          const remaining = r.allocated - r.used;
          const usagePct = r.allocated ? Math.round((r.used / r.allocated) * 100) : 0;
          const task = tasks.find((t) => t.id === r.taskId);
          return (
            <div key={r.id} className="rounded-md border border-line p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink">{r.name}</span>
                <span className="font-mono text-xs text-inkmuted">
                  {r.used}/{r.allocated} {r.unit} used
                </span>
              </div>
              <div className="mt-2">
                <ProgressBar value={usagePct} size="sm" tone={usagePct >= 90 ? "amber" : "brand"} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-inkmuted">
                <span>{task ? task.name : "Project-wide"}</span>
                <span>
                  {remaining} {r.unit} remaining · {r.required} required
                </span>
              </div>
            </div>
          );
        })}
        {resources.length === 0 && (
          <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-xs text-inkmuted">
            No resources allocated yet.
          </p>
        )}
      </div>
    </div>
  );
}

function AddResourceForm({
  projectId,
  tasks,
  onDone,
}: {
  projectId: string;
  tasks: Task[];
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [allocated, setAllocated] = useState("");
  const [required, setRequired] = useState("");
  const [taskId, setTaskId] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !allocated) return;
    setSaving(true);
    await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        taskId: taskId || null,
        name,
        unit,
        allocated: Number(allocated),
        required: Number(required) || Number(allocated),
      }),
    });
    setSaving(false);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-2 rounded-md border border-line bg-surface2 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          placeholder="Resource name (e.g. Cement)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        />
        <input
          placeholder="Unit (e.g. bags, tons, meters)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        />
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <input
          type="number"
          min={0}
          placeholder="Allocated qty"
          value={allocated}
          onChange={(e) => setAllocated(e.target.value)}
          className="rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        />
        <input
          type="number"
          min={0}
          placeholder="Required qty (total)"
          value={required}
          onChange={(e) => setRequired(e.target.value)}
          className="rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        />
        <select
          value={taskId}
          onChange={(e) => setTaskId(e.target.value)}
          className="rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        >
          <option value="">Project-wide</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={saving || !name || !allocated}
        className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
      >
        {saving ? "Allocating…" : "Allocate resource"}
      </button>
    </form>
  );
}

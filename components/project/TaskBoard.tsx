"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, ListChecks } from "lucide-react";
import Badge from "@/components/Badge";
import ProgressBar from "@/components/ProgressBar";
import type { Task, User } from "@/lib/types";

const STATUS_OPTIONS = ["not_started", "in_progress", "completed", "delayed", "on_hold"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

export default function TaskBoard({
  projectId,
  tasks,
  supervisors,
}: {
  projectId: string;
  tasks: Task[];
  supervisors: User[];
}) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="rounded-md border border-line bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <ListChecks size={15} className="text-brand" /> Task breakdown &amp; supervisor assignment
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink hover:border-brand hover:text-brand"
        >
          <Plus size={13} /> Add task
        </button>
      </div>

      {showAdd && (
        <AddTaskForm
          projectId={projectId}
          supervisors={supervisors}
          onDone={() => {
            setShowAdd(false);
            router.refresh();
          }}
        />
      )}

      <div className="space-y-2">
        {tasks.map((t) => (
          <TaskRow key={t.id} task={t} supervisors={supervisors} onSaved={() => router.refresh()} />
        ))}
        {tasks.length === 0 && (
          <p className="rounded-md border border-dashed border-line px-4 py-6 text-center text-xs text-inkmuted">
            No tasks yet — break this project down into tasks to get started.
          </p>
        )}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  supervisors,
  onSaved,
}: {
  task: Task;
  supervisors: User[];
  onSaved: () => void;
}) {
  const [supervisorId, setSupervisorId] = useState(task.supervisorId || "");
  const [status, setStatus] = useState(task.status);
  const [progress, setProgress] = useState(task.progress);
  const [saving, setSaving] = useState(false);

  const dirty = supervisorId !== (task.supervisorId || "") || status !== task.status || progress !== task.progress;

  async function save() {
    setSaving(true);
    await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supervisorId: supervisorId || null, status, progress: Number(progress) }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="rounded-md border border-line p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-ink">{task.name}</div>
          <div className="text-xs text-inkmuted">{task.description}</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-inkmuted">
            <Badge value={task.priority} />
            <span className="font-mono">Due {task.deadline || "—"}</span>
          </div>
        </div>
        <Badge value={task.status} />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
        <select
          value={supervisorId}
          onChange={(e) => setSupervisorId(e.target.value)}
          className="rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        >
          <option value="">Unassigned</option>
          {supervisors.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Task["status"])}
          className="rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-20 rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        />
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="flex items-center justify-center gap-1 rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
        >
          <Save size={12} /> {saving ? "Saving…" : "Save"}
        </button>
      </div>
      <div className="mt-2">
        <ProgressBar value={progress} size="sm" tone={status === "delayed" ? "amber" : "brand"} />
      </div>
    </div>
  );
}

function AddTaskForm({
  projectId,
  supervisors,
  onDone,
}: {
  projectId: string;
  supervisors: User[];
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [supervisorId, setSupervisorId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("medium");
  const [requiredResources, setRequiredResources] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        name,
        description,
        supervisorId: supervisorId || null,
        deadline,
        priority,
        requiredResources,
      }),
    });
    setSaving(false);
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-2 rounded-md border border-line bg-surface2 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          placeholder="Task name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        />
        <select
          value={supervisorId}
          onChange={(e) => setSupervisorId(e.target.value)}
          className="rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        >
          <option value="">Unassigned</option>
          {supervisors.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
      />
      <div className="grid gap-2 sm:grid-cols-3">
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        >
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p} priority
            </option>
          ))}
        </select>
        <input
          placeholder="Required resources"
          value={requiredResources}
          onChange={(e) => setRequiredResources(e.target.value)}
          className="rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={saving || !name}
        className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
      >
        {saving ? "Adding…" : "Add task"}
      </button>
    </form>
  );
}

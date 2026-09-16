"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus } from "lucide-react";
import type { Resource } from "@/lib/types";

export default function RequestResourceButton({ resource }: { resource: Resource }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const remaining = resource.allocated - resource.used;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!quantity || !resource.taskId) return;
    setSaving(true);
    await fetch("/api/resource-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: resource.taskId,
        resourceName: resource.name,
        currentQuantity: remaining,
        requestedQuantity: Number(quantity),
        reason,
      }),
    });
    setSaving(false);
    setOpen(false);
    setQuantity("");
    setReason("");
    router.refresh();
  }

  if (!resource.taskId) return null;

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
      >
        <PackagePlus size={13} /> Request more
      </button>
      {open && (
        <form onSubmit={handleSubmit} className="mt-2 space-y-2 rounded-md border border-line bg-surface2 p-3">
          <input
            type="number"
            min={1}
            required
            placeholder={`Additional ${resource.unit} needed`}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
          />
          <textarea
            placeholder="Reason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-md border border-line bg-bg px-2 py-1.5 text-xs text-ink focus:border-brand focus:outline-none"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            {saving ? "Sending…" : "Send request"}
          </button>
        </form>
      )}
    </div>
  );
}

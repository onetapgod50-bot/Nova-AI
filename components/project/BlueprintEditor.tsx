"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FileStack, Save, UploadCloud } from "lucide-react";
import type { Blueprint } from "@/lib/types";

export default function BlueprintEditor({
  projectId,
  blueprint,
}: {
  projectId: string;
  blueprint: Blueprint | null;
}) {
  const router = useRouter();
  const [fileName, setFileName] = useState(blueprint?.fileName || "");
  const [notes, setNotes] = useState(blueprint?.notes || "");
  const [measurements, setMeasurements] = useState(blueprint?.measurements || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blueprint: { fileName, notes, measurements } }),
    });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="rounded-md border border-line bg-surface p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <FileStack size={15} className="text-brand" /> Blueprint &amp; Planning
      </div>
      {blueprint && (
        <p className="mt-1 text-xs text-inkmuted">
          Version {blueprint.version} · uploaded {blueprint.uploadDate}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="flex cursor-pointer items-center justify-between rounded-md border border-dashed border-line px-3 py-2.5 text-sm hover:border-brand">
          <span className="flex items-center gap-2 text-inkmuted">
            <UploadCloud size={15} />
            {fileName || "Upload blueprint file"}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name || fileName)}
          />
        </label>

        <div>
          <label className="mb-1 block text-xs font-medium text-inkmuted">Key measurements</label>
          <textarea
            rows={2}
            value={measurements}
            onChange={(e) => setMeasurements(e.target.value)}
            placeholder="Floor-to-floor height, column grid, foundation depth…"
            className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-inkmuted focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-inkmuted">Planning notes</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes for the manager and supervisors…"
            className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-inkmuted focus:border-brand focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-60"
          >
            <Save size={14} /> {saving ? "Saving…" : "Save planning info"}
          </button>
          {saved && <span className="text-xs text-brand">Saved — visible to the manager now.</span>}
        </div>
      </form>
    </div>
  );
}

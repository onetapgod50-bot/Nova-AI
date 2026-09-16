"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, Send, UploadCloud } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import type { SitePhoto, Task } from "@/lib/types";

export default function TaskUpdatePanel({
  task,
  initialPhotos,
}: {
  task: Task;
  initialPhotos: SitePhoto[];
}) {
  const router = useRouter();

  // progress update
  const [progress, setProgress] = useState(task.progress);
  const [workCompleted, setWorkCompleted] = useState("");
  const [workRemaining, setWorkRemaining] = useState("");
  const [issues, setIssues] = useState("");
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updateSaved, setUpdateSaved] = useState(false);

  // photos
  const [photos, setPhotos] = useState(initialPhotos);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoDescription, setPhotoDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // completion
  const [completionDescription, setCompletionDescription] = useState("");
  const [remarks, setRemarks] = useState("");
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  const canComplete = progress === 100 && photos.length > 0 && task.status !== "completed";

  async function submitUpdate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setUpdateSaved(false);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id, progress, workCompleted, workRemaining, issues, comments }),
    });
    setSubmitting(false);
    setUpdateSaved(true);
    router.refresh();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadPhoto() {
    if (!preview) return;
    setUploading(true);
    const res = await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id, imageDataUrl: preview, description: photoDescription }),
    });
    const data = await res.json();
    if (res.ok) {
      setPhotos((cur) => [data.photo, ...cur]);
      setPreview(null);
      setPhotoDescription("");
      if (fileInput.current) fileInput.current.value = "";
    }
    setUploading(false);
    router.refresh();
  }

  async function markComplete() {
    setError("");
    if (!canComplete) return;
    if (!completionDescription.trim()) {
      setError("Add a short completion description before marking this task done.");
      return;
    }
    setCompleting(true);
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId: task.id,
        progress: 100,
        workCompleted: completionDescription,
        workRemaining: "None",
        comments: remarks,
      }),
    });
    await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed", progress: 100 }),
    });
    setCompleting(false);
    router.push("/supervisor/tasks");
    router.refresh();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* progress update */}
      <form onSubmit={submitUpdate} className="space-y-4 rounded-md border border-line bg-surface p-5">
        <div className="text-sm font-semibold text-ink">Update progress</div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-inkmuted">
            <span>Current progress</span>
            <span className="font-mono">{progress}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-[var(--brand)]"
          />
          <div className="mt-2"><ProgressBar value={progress} /></div>
        </div>

        <Field label="Work completed">
          <textarea rows={2} value={workCompleted} onChange={(e) => setWorkCompleted(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Work remaining">
          <textarea rows={2} value={workRemaining} onChange={(e) => setWorkRemaining(e.target.value)} className={inputCls} />
        </Field>
        <Field label="Issues / problems">
          <textarea rows={2} value={issues} onChange={(e) => setIssues(e.target.value)} className={inputCls} placeholder="None" />
        </Field>
        <Field label="Comments">
          <textarea rows={2} value={comments} onChange={(e) => setComments(e.target.value)} className={inputCls} />
        </Field>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-60"
          >
            <Send size={14} /> {submitting ? "Submitting…" : "Submit progress update"}
          </button>
          {updateSaved && <span className="text-xs text-brand">Sent to your manager.</span>}
        </div>
      </form>

      {/* photos + completion */}
      <div className="space-y-5">
        <div className="rounded-md border border-line bg-surface p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <Camera size={15} className="text-brand" /> Site photos
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-md border border-dashed border-line px-3 py-2.5 text-sm hover:border-brand">
            <span className="flex items-center gap-2 text-inkmuted">
              <UploadCloud size={15} /> {preview ? "Photo selected" : "Choose a site photo"}
            </span>
            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>

          {preview && (
            <div className="mt-3 space-y-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Preview" className="h-32 w-full rounded-md object-cover" />
              <input
                placeholder="Description (e.g. Floor 5 framing complete)"
                value={photoDescription}
                onChange={(e) => setPhotoDescription(e.target.value)}
                className={inputCls}
              />
              <button
                onClick={uploadPhoto}
                disabled={uploading}
                type="button"
                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {uploading ? "Uploading…" : "Upload photo"}
              </button>
            </div>
          )}

          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {photos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={p.id} src={p.imageDataUrl} alt={p.description} className="aspect-square w-full rounded-md object-cover" />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-md border border-line bg-surface p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <CheckCircle2 size={15} className="text-brand" /> Mark task as completed
          </div>

          {task.status === "completed" ? (
            <p className="text-sm text-brand">This task is already marked complete.</p>
          ) : (
            <>
              <ul className="mb-3 space-y-1 text-xs text-inkmuted">
                <li className={progress === 100 ? "text-brand" : ""}>• Progress must be 100% (currently {progress}%)</li>
                <li className={photos.length > 0 ? "text-brand" : ""}>• At least one site photo uploaded ({photos.length} so far)</li>
              </ul>
              <Field label="Completion description">
                <textarea rows={2} value={completionDescription} onChange={(e) => setCompletionDescription(e.target.value)} className={inputCls} />
              </Field>
              <div className="mt-3">
                <Field label="Remarks (optional)">
                  <textarea rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} className={inputCls} />
                </Field>
              </div>
              {error && <p className="mt-2 text-xs text-clay">{error}</p>}
              <button
                onClick={markComplete}
                disabled={!canComplete || completing}
                className="mt-3 w-full rounded-md bg-brand py-2.5 text-sm font-medium text-white disabled:opacity-40"
              >
                {completing ? "Submitting…" : "Mark Task as Completed"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-inkmuted focus:border-brand focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-inkmuted">{label}</label>
      {children}
    </div>
  );
}

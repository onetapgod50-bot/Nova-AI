"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, X } from "lucide-react";

const DOC_FIELDS = ["Blueprint", "Site Plan", "Land Documents", "Project Images"];

export default function CreateProjectForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    employer: "",
    location: "",
    landArea: "",
    gpsLocation: "",
    projectType: "",
    description: "",
    requiredInfrastructure: "",
    startDate: "",
    expectedCompletion: "",
    budget: "",
    requiredWorkers: "",
    otherRequirements: "",
  });
  const [files, setFiles] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.employer || !form.location) {
      setError("Project name, employer, and location are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Couldn't create the project.");
        setLoading(false);
        return;
      }
      router.push(`/engineer/projects/${data.project.id}`);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <Section title="Project basics">
        <Field label="Project Name" required>
          <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Employer / Client Name" required>
          <input className={inputCls} value={form.employer} onChange={(e) => set("employer", e.target.value)} />
        </Field>
        <Field label="Project Location" required>
          <input className={inputCls} value={form.location} onChange={(e) => set("location", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Land Area">
            <input className={inputCls} placeholder="e.g. 4.2 acres" value={form.landArea} onChange={(e) => set("landArea", e.target.value)} />
          </Field>
          <Field label="GPS Location">
            <input className={inputCls} placeholder="lat, long" value={form.gpsLocation} onChange={(e) => set("gpsLocation", e.target.value)} />
          </Field>
        </div>
        <Field label="Project Type">
          <input className={inputCls} placeholder="e.g. Mixed-use residential" value={form.projectType} onChange={(e) => set("projectType", e.target.value)} />
        </Field>
        <Field label="Project Description">
          <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <Field label="Required Infrastructure">
          <textarea className={inputCls} rows={2} value={form.requiredInfrastructure} onChange={(e) => set("requiredInfrastructure", e.target.value)} />
        </Field>
      </Section>

      <Section title="Schedule & budget">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Expected Start Date">
            <input type="date" className={inputCls} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </Field>
          <Field label="Expected Completion Date">
            <input type="date" className={inputCls} value={form.expectedCompletion} onChange={(e) => set("expectedCompletion", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Estimated Budget (USD)">
            <input type="number" min={0} className={inputCls} value={form.budget} onChange={(e) => set("budget", e.target.value)} />
          </Field>
          <Field label="Number of Workers">
            <input type="number" min={0} className={inputCls} value={form.requiredWorkers} onChange={(e) => set("requiredWorkers", e.target.value)} />
          </Field>
        </div>
        <Field label="Other Requirements">
          <textarea className={inputCls} rows={2} value={form.otherRequirements} onChange={(e) => set("otherRequirements", e.target.value)} />
        </Field>
      </Section>

      <Section title="Documents & files">
        <p className="-mt-2 mb-1 text-xs text-inkmuted">
          File uploads are captured here for the interface. Connect a storage provider (Vercel Blob, S3, etc.) to persist the actual files.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {DOC_FIELDS.map((label) => (
            <label
              key={label}
              className="flex cursor-pointer items-center justify-between rounded-md border border-dashed border-line px-3 py-2.5 text-sm hover:border-brand"
            >
              <span className="flex items-center gap-2 text-inkmuted">
                <UploadCloud size={15} />
                {files[label] || label}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFiles((f) => ({ ...f, [label]: e.target.files?.[0]?.name || "" }))}
              />
              {files[label] && (
                <X
                  size={14}
                  className="text-inkmuted hover:text-clay"
                  onClick={(e) => {
                    e.preventDefault();
                    setFiles((f) => ({ ...f, [label]: "" }));
                  }}
                />
              )}
            </label>
          ))}
        </div>
      </Section>

      {error && <p className="rounded-md border border-clay/30 bg-clay/10 px-3 py-2 text-sm text-clay">{error}</p>}

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-60"
        >
          {loading ? "Creating…" : "Save project plan"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-inkmuted focus:border-brand focus:outline-none";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-surface p-5">
      <h2 className="mb-4 text-sm font-semibold text-ink">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-inkmuted">
        {label} {required && <span className="text-clay">*</span>}
      </label>
      {children}
    </div>
  );
}

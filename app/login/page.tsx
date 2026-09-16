"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HardHat, AlertCircle } from "lucide-react";
import type { Role } from "@/lib/types";

const ROLES: { value: Role; label: string }[] = [
  { value: "engineer", label: "Engineer" },
  { value: "manager", label: "Manager" },
  { value: "supervisor", label: "Supervisor" },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("engineer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Couldn't sign you in. Check your details and try again.");
        setLoading(false);
        return;
      }
      router.push(`/${role}/dashboard`);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-10 blueprint-field">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-white">
            <HardHat size={18} />
          </span>
          <span className="font-mono text-lg font-semibold text-ink">BuildNova</span>
        </Link>

        <div className="rounded-md border border-line bg-surface p-6">
          <h1 className="text-lg font-semibold text-ink">Sign in</h1>
          <p className="mt-1 text-sm text-inkmuted">Choose your role to continue.</p>

          <div className="mt-5 grid grid-cols-3 gap-1 rounded-md border border-line bg-surface2 p-1">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                  role === r.value ? "bg-surface text-brand shadow-sm" : "text-inkmuted"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-inkmuted">Email / Username</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-inkmuted">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-clay/30 bg-clay/10 px-3 py-2 text-xs text-clay">
                <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-brand py-2.5 text-sm font-medium text-white hover:bg-brand-bright disabled:opacity-60"
            >
              {loading ? "Signing in…" : `Log in as ${ROLES.find((r) => r.value === role)?.label}`}
            </button>

            <div className="flex items-center justify-between pt-1 text-xs text-inkmuted">
              <button type="button" onClick={() => alert("Password reset isn't set up in this demo yet.")} className="hover:text-brand">
                Forgot password?
              </button>
              <button type="button" onClick={() => alert("Account creation isn't open yet.")} className="hover:text-brand">
                Create account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

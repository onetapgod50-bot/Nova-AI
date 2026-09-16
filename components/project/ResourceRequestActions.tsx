"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Pencil } from "lucide-react";

export default function ResourceRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [modifying, setModifying] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [busy, setBusy] = useState(false);

  async function respond(status: "approved" | "rejected" | "modified", modifiedQuantity?: number) {
    setBusy(true);
    await fetch(`/api/resource-requests/${requestId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, modifiedQuantity }),
    });
    setBusy(false);
    setModifying(false);
    router.refresh();
  }

  if (modifying) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          autoFocus
          placeholder="New qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-24 rounded-md border border-line bg-bg px-2 py-1 text-xs text-ink focus:border-brand focus:outline-none"
        />
        <button
          onClick={() => quantity && respond("modified", Number(quantity))}
          disabled={busy || !quantity}
          className="rounded-md bg-brand px-2.5 py-1 text-xs font-medium text-white disabled:opacity-40"
        >
          Save
        </button>
        <button onClick={() => setModifying(false)} className="text-xs text-inkmuted hover:text-ink">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => respond("approved")}
        disabled={busy}
        className="flex items-center gap-1 rounded-md bg-brand px-2.5 py-1.5 text-xs font-medium text-white disabled:opacity-40"
      >
        <Check size={12} /> Approve
      </button>
      <button
        onClick={() => setModifying(true)}
        disabled={busy}
        className="flex items-center gap-1 rounded-md border border-line px-2.5 py-1.5 text-xs font-medium text-ink hover:border-brand disabled:opacity-40"
      >
        <Pencil size={12} /> Modify
      </button>
      <button
        onClick={() => respond("rejected")}
        disabled={busy}
        className="flex items-center gap-1 rounded-md border border-clay/30 px-2.5 py-1.5 text-xs font-medium text-clay hover:bg-clay/10 disabled:opacity-40"
      >
        <X size={12} /> Reject
      </button>
    </div>
  );
}

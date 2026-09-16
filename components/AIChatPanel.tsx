"use client";

import { useRef, useState } from "react";
import { Bot, Send, User, Loader2 } from "lucide-react";
import type { ChatMessage, Role } from "@/lib/types";

const SUGGESTIONS: Record<Role, string[]> = {
  engineer: [
    "What's the overall progress on Construction Site A?",
    "Which of my projects are still in planning?",
    "What's the expected completion date for Riverside Bridge Expansion?",
  ],
  manager: [
    "Which projects are delayed?",
    "Which supervisor is handling Electrical Work?",
    "Show me pending resource requests.",
  ],
  supervisor: [
    "What are my pending tasks?",
    "How much cement do I have remaining?",
    "What's the status of my resource requests?",
  ],
};

export default function AIChatPanel({ role }: { role: Role }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hi, I'm BuildNova AI. Ask me about project progress, tasks, resources, supervisors, or deadlines — I can only see the data your account is authorized to view.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: next.slice(0, -1) }),
      });
      const data = await res.json();
      setMessages((cur) => [
        ...cur,
        { role: "model", text: data.reply || "I couldn't find that information in the BuildNova project database." },
      ]);
    } catch {
      setMessages((cur) => [
        ...cur,
        { role: "model", text: "BuildNova AI couldn't be reached. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[480px] flex-col overflow-hidden rounded-md border border-line bg-surface">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-soft text-brand">
          <Bot size={16} />
        </span>
        <div>
          <div className="text-sm font-semibold text-ink">BuildNova AI</div>
          <div className="text-xs text-inkmuted">Answers only from your authorized project data</div>
        </div>
      </div>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                m.role === "user" ? "bg-blueprint/15 text-blueprint" : "bg-brand-soft text-brand"
              }`}
            >
              {m.role === "user" ? <User size={13} /> : <Bot size={13} />}
            </span>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-md px-3 py-2 text-sm leading-relaxed ${
                m.role === "user" ? "bg-blueprint/10 text-ink" : "bg-surface2 text-ink"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-inkmuted">
            <Loader2 size={13} className="animate-spin" /> BuildNova AI is checking the project data…
          </div>
        )}
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 border-t border-line px-4 py-3">
          {SUGGESTIONS[role].map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-line px-3 py-1.5 text-xs text-inkmuted hover:border-brand hover:text-brand"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-line p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about progress, tasks, resources…"
          className="flex-1 rounded-md border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-inkmuted focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-white disabled:opacity-40"
          aria-label="Send"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}

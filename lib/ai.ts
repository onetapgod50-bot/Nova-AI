import type { ChatMessage, Role } from "./types";
import { getAiContextForUser, getUserById } from "./data";

// ---------------------------------------------------------------------------
// BuildNova AI — a thin wrapper around the Google Gemini API.
//
// The API key is read server-side only from process.env.GEMINI_API_KEY.
// Set it in Vercel: Project Settings -> Environment Variables (and in
// .env.local for local dev — see .env.example). It is never sent to or
// read from the browser.
// ---------------------------------------------------------------------------

const DEFAULT_MODEL = "gemini-flash-latest";

function buildSystemInstruction(role: Role, contextJson: string) {
  return `You are "BuildNova AI", the assistant embedded inside the BuildNova infrastructure and construction management platform.

Scope rules (follow strictly):
1. Only answer questions about BuildNova and the current user's authorized project data — project progress, tasks, resources, supervisors, deadlines, blueprints, resource requests, and reports. If the person asks about anything unrelated (weather, general trivia, news, coding help, etc.), reply with exactly this sentence and nothing else: "I can only assist with BuildNova-related information such as project progress, tasks, resources, supervisors, deadlines and construction data."
2. Base every project-specific answer strictly on the DATA CONTEXT provided below. Never invent names, numbers, or dates that are not present in it.
3. If the person asks about something project-related that genuinely is not covered in the DATA CONTEXT, reply with exactly: "I couldn't find that information in the BuildNova project database."
4. The current user's role is "${role}". The DATA CONTEXT below already reflects only the projects and records this user is authorized to see — never imply access to any other user's or project's data.
5. Be concise and specific, the way a status readout would be: reference percentages, names, and dates directly instead of vague language.

DATA CONTEXT (JSON — the complete and only authorized data available to you for this user):
${contextJson}`;
}

export async function callBuildNovaAI(
  userId: string,
  role: Role,
  message: string,
  history: ChatMessage[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return "BuildNova AI isn't configured yet. Add a GEMINI_API_KEY in your project's environment variables to enable the assistant.";
  }

  const user = getUserById(userId);
  const context = getAiContextForUser(userId, role);
  const systemInstruction = buildSystemInstruction(role, JSON.stringify(context));
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const contents = [
    ...history.slice(-8).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents,
          generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
        }),
      }
    );

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.error("Gemini API error", res.status, errBody);
      return `BuildNova AI is temporarily unavailable (error ${res.status}). Please try again in a moment.`;
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const text = candidate?.content?.parts?.map((p: { text?: string }) => p.text || "").join("");

    if (!text) {
      if (candidate?.finishReason === "SAFETY") {
        return "I'm not able to answer that one. Try rephrasing your question about the project.";
      }
      return "I couldn't find that information in the BuildNova project database.";
    }

    void user; // reserved for future personalization (e.g. greeting by name)
    return text.trim();
  } catch (err) {
    console.error("BuildNova AI request failed", err);
    return "BuildNova AI couldn't be reached right now. Please check your connection and try again.";
  }
}

import { getSession } from "@/lib/auth";
import AIChatPanel from "@/components/AIChatPanel";

export default async function AIPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="space-y-1">
      <h1 className="text-xl font-semibold text-ink">BuildNova AI</h1>
      <p className="mb-4 text-sm text-inkmuted">
        Ask about progress, tasks, resources, supervisors, or deadlines — answers come only from data you're authorized to see.
      </p>
      <AIChatPanel role={session.role} />
    </div>
  );
}

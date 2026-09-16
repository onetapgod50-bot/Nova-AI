import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import CreateProjectForm from "@/components/CreateProjectForm";

export default async function NewProjectPage() {
  const session = await getSession();
  if (!session) return null;
  if (session.role !== "engineer") redirect(`/${session.role}/projects`);

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">Create Project</h1>
      <p className="mt-1 text-sm text-inkmuted">
        Capture employer requirements and site details. You can add the blueprint and planning notes once it's saved.
      </p>
      <div className="mt-6">
        <CreateProjectForm />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserById, getNotificationsForUser } from "@/lib/data";
import DashboardChrome from "@/components/DashboardChrome";

export default async function RoleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ role: string }>;
}) {
  const { role } = await params;
  const session = await getSession();

  if (!session || session.role !== role) {
    redirect("/login");
  }

  const user = getUserById(session.userId);
  if (!user) redirect("/login");

  const unread = getNotificationsForUser(session.userId).filter((n) => !n.read).length;

  return (
    <DashboardChrome
      role={session.role}
      userName={user.name}
      userTitle={user.title}
      avatarColor={user.avatarColor}
      notifCount={unread}
    >
      {children}
    </DashboardChrome>
  );
}

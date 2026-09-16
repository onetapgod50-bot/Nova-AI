import { getSession } from "@/lib/auth";
import { getNotificationsForUser } from "@/lib/data";
import NotificationsList from "@/components/NotificationsList";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) return null;

  const notifications = getNotificationsForUser(session.userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Notifications</h1>
        <p className="mt-1 text-sm text-inkmuted">Updates relevant to your role and your projects.</p>
      </div>
      <NotificationsList initial={notifications} />
    </div>
  );
}

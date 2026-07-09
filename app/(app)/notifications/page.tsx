import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { NotificationRow } from "@/components/notifications/notification-row";

export default async function NotificationsPage() {
  const { supabase, user } = await getCurrentProfile();

  if (!user) {
    redirect("/login");
  }

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, type, title, body, task_id, is_read, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Bildirimler</h1>
      <ul className="space-y-2">
        {(notifications ?? []).map((notification) => (
          <NotificationRow key={notification.id} notification={notification} />
        ))}
        {(notifications ?? []).length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Henüz bildirim yok.
          </li>
        )}
      </ul>
    </div>
  );
}

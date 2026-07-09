"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// RLS (notifications_update_own) zaten user_id = auth.uid() dışındaki satırları
// engeller; başka bir kullanıcının bildirimi için id gönderilse bile hiçbir satır
// güncellenmez.
export async function markNotificationRead(id: string) {
  const supabase = await createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  revalidatePath("/notifications");
}

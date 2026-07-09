"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireAdmin } from "./guard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SystemRole } from "@/lib/supabase/types";

export type InviteState = { error?: string; success?: string } | undefined;

export async function inviteUser(
  _prevState: InviteState,
  formData: FormData
): Promise<InviteState> {
  await requireAdmin();

  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "E-posta gerekli." };
  }

  // Supabase'in davet linki, redirectTo Auth ayarlarındaki "Redirect URLs"
  // izin listesinde olmadığı sürece bunu yok sayıp Site URL'e döner — bu
  // yüzden hem kod hem Supabase Dashboard tarafı eşleşmeli (bkz. BOOTSTRAP.md).
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const redirectTo = `${protocol}://${host}/set-password`;

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  });

  if (error) {
    return { error: `Davet gönderilemedi: ${error.message}` };
  }

  revalidatePath("/admin/users");
  return { success: `${email} adresine davet gönderildi.` };
}

export async function updateUserRole(userId: string, roleId: string | null) {
  const { supabase } = await requireAdmin();
  await supabase.from("profiles").update({ role_id: roleId }).eq("id", userId);
  revalidatePath("/admin/users");
}

export async function updateSystemRole(userId: string, systemRole: SystemRole) {
  const { supabase } = await requireAdmin();
  await supabase
    .from("profiles")
    .update({ system_role: systemRole })
    .eq("id", userId);
  revalidatePath("/admin/users");
}

export async function deleteUser(
  userId: string
): Promise<{ error?: string } | undefined> {
  const { user } = await requireAdmin();

  if (userId === user.id) {
    return { error: "Kendi hesabınızı silemezsiniz." };
  }

  const adminClient = createAdminClient();

  // tasks.assignee_id -> profiles(id) "on delete" davranışı tanımlanmadığı için
  // (geçmiş görev kayıtları korunsun diye bilinçli), atanmış görevi olan bir
  // kullanıcı silinemez — burada erken ve anlaşılır bir hata veriyoruz.
  const { count } = await adminClient
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("assignee_id", userId);

  if (count && count > 0) {
    return {
      error: `Bu kullanıcıya atanmış ${count} görev var. Silmeden önce görevleri başka birine atayın veya silin.`,
    };
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) {
    return { error: "Kullanıcı silinemedi." };
  }

  revalidatePath("/admin/users");
  return undefined;
}

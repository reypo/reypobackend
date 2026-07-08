"use server";

import { revalidatePath } from "next/cache";
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

  const adminClient = createAdminClient();
  const { error } = await adminClient.auth.admin.inviteUserByEmail(email);

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

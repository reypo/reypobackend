import "server-only";
import { createClient } from "@/lib/supabase/server";

// Her admin Server Action'ının ilk satırı bunu çağırmalı (bkz. PLAN.md #10
// Güvenlik Kontrol Listesi) — UI'da admin linkinin gizli olması yeterli değil.
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Oturum açılmamış.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("system_role")
    .eq("id", user.id)
    .single();

  if (profile?.system_role !== "admin") {
    throw new Error("Bu işlem için yönetici yetkisi gerekiyor.");
  }

  return { supabase, user };
}

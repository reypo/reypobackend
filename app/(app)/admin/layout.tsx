import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/current-profile";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, profile } = await getCurrentProfile();

  if (!user) {
    redirect("/login");
  }

  // (app)/layout.tsx zaten oturumu doğruladı; burada sadece yönetici yetkisi kontrol edilir.
  if (profile?.system_role !== "admin") {
    redirect("/");
  }

  return (
    <div className="space-y-4">
      <nav className="flex gap-4 border-b border-border pb-2 text-sm">
        <Link href="/admin">Özet</Link>
        <Link href="/admin/roles">Roller</Link>
        <Link href="/admin/users">Kullanıcılar</Link>
      </nav>
      {children}
    </div>
  );
}

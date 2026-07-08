import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { logout } from "@/lib/actions/auth";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, profile } = await getCurrentProfile();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/">Görevlerim</Link>
          <Link href="/projects">Projeler</Link>
          {profile?.system_role === "admin" && (
            <Link href="/admin" className="underline underline-offset-2">
              Yönetim
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            {profile?.full_name || user.email}
            {profile?.system_role === "admin" ? " · Yönetici" : ""}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm underline underline-offset-2"
            >
              Çıkış
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}

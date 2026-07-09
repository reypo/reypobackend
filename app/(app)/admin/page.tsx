import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: userCount },
    { count: roleCount },
    { count: projectCount },
    { count: taskCount },
    { count: doneCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("roles").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("tasks").select("*", { count: "exact", head: true }),
    supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .eq("status", "done"),
  ]);

  const stats = [
    { label: "Kullanıcı", value: userCount ?? 0, href: "/admin/users" },
    { label: "İş Rolü", value: roleCount ?? 0, href: "/admin/roles" },
    { label: "Proje", value: projectCount ?? 0, href: "/projects" },
    {
      label: "Görev",
      value: taskCount ?? 0,
      detail: `${doneCount ?? 0} tamamlandı`,
    },
  ];

  return (
    <div>
      <h1 className="text-lg font-semibold">Yönetim Özeti</h1>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const content = (
            <>
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {stat.label}
              </p>
              {stat.detail && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.detail}
                </p>
              )}
            </>
          );
          const cardClass =
            "rounded-xl border border-border bg-card p-4 shadow-xs";
          return stat.href ? (
            <Link
              key={stat.label}
              href={stat.href}
              className={`${cardClass} transition-all hover:border-ring/40 hover:shadow-sm`}
            >
              {content}
            </Link>
          ) : (
            <div key={stat.label} className={cardClass}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

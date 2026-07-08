import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: userCount },
    { count: roleCount },
    { count: projectCount },
    { count: taskCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("roles").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("tasks").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Kullanıcı", value: userCount ?? 0 },
    { label: "İş Rolü", value: roleCount ?? 0 },
    { label: "Proje", value: projectCount ?? 0 },
    { label: "Görev", value: taskCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-lg font-semibold">Yönetim Özeti</h1>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border p-4">
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

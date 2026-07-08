import { createClient } from "@/lib/supabase/server";
import { deleteRole } from "@/lib/actions/roles";
import { RoleForm } from "@/components/admin/role-form";

export default async function RolesPage() {
  const supabase = await createClient();
  const { data: roles } = await supabase
    .from("roles")
    .select("id, name, color")
    .order("created_at");

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">İş Rolleri</h1>
      <RoleForm />
      <ul className="divide-y divide-border rounded-lg border border-border">
        {(roles ?? []).map((role) => (
          <li
            key={role.id}
            className="flex items-center justify-between gap-3 px-4 py-3"
          >
            <span className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: role.color ?? "#999" }}
              />
              {role.name}
            </span>
            <form action={deleteRole.bind(null, role.id)}>
              <button
                type="submit"
                className="text-sm text-destructive underline underline-offset-2"
              >
                Sil
              </button>
            </form>
          </li>
        ))}
        {(roles ?? []).length === 0 && (
          <li className="px-4 py-3 text-sm text-muted-foreground">
            Henüz iş rolü yok.
          </li>
        )}
      </ul>
    </div>
  );
}

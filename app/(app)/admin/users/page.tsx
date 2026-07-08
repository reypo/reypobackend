import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { InviteForm } from "@/components/admin/invite-form";
import { UserRoleRow, type UserRow } from "@/components/admin/user-role-row";

export default async function UsersPage() {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const [{ data: authUsers }, { data: profiles }, { data: roles }] =
    await Promise.all([
      adminClient.auth.admin.listUsers(),
      supabase.from("profiles").select("id, full_name, system_role, role_id"),
      supabase.from("roles").select("id, name").order("created_at"),
    ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  const rows: UserRow[] = (authUsers?.users ?? []).map((u) => {
    const profile = profileById.get(u.id);
    return {
      id: u.id,
      email: u.email ?? "",
      fullName: profile?.full_name ?? "",
      systemRole: profile?.system_role ?? "member",
      roleId: profile?.role_id ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Kullanıcılar</h1>
      <InviteForm />
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Kullanıcı</th>
              <th className="px-4 py-2 font-medium">İş Rolü</th>
              <th className="px-4 py-2 font-medium">Yetki</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <UserRoleRow key={row.id} user={row} roles={roles ?? []} />
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-3 text-muted-foreground"
                >
                  Henüz kullanıcı yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

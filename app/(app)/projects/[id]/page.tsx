import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { TaskForm } from "@/components/projects/task-form";
import { TaskCard } from "@/components/task-card";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, profile } = await getCurrentProfile();
  const isAdmin = profile?.system_role === "admin";

  const { data: project } = await supabase
    .from("projects")
    .select("id, name, description")
    .eq("id", id)
    .single();

  if (!project) {
    notFound();
  }

  // RLS burada da geçerli: member sadece kendi görevlerini görür (tasks_select_own_or_admin).
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, status, priority, assignee_id, due_date")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, full_name");
  const nameById = new Map((allProfiles ?? []).map((p) => [p.id, p.full_name]));

  let roles: { id: string; name: string }[] = [];
  let assignees: { id: string; label: string; roleId: string | null }[] = [];

  if (isAdmin) {
    const [{ data: roleRows }, { data: profileRows }, { data: authUsers }] =
      await Promise.all([
        supabase.from("roles").select("id, name").order("created_at"),
        supabase.from("profiles").select("id, full_name, role_id"),
        createAdminClient().auth.admin.listUsers(),
      ]);

    roles = roleRows ?? [];
    const emailById = new Map(
      (authUsers?.users ?? []).map((u) => [u.id, u.email ?? ""])
    );
    assignees = (profileRows ?? []).map((p) => ({
      id: p.id,
      label: p.full_name || emailById.get(p.id) || "Kullanıcı",
      roleId: p.role_id,
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {project.description}
          </p>
        )}
      </div>

      {isAdmin && (
        <TaskForm projectId={project.id} roles={roles} assignees={assignees} />
      )}

      <ul className="space-y-2">
        {(tasks ?? []).map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            assigneeName={nameById.get(task.assignee_id) ?? ""}
          />
        ))}
        {(tasks ?? []).length === 0 && (
          <li className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
            Bu projede henüz görev yok.
          </li>
        )}
      </ul>
    </div>
  );
}

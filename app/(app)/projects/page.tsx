import Link from "next/link";
import { getCurrentProfile } from "@/lib/supabase/current-profile";
import { ProjectForm } from "@/components/projects/project-form";

export default async function ProjectsPage() {
  const { supabase, profile } = await getCurrentProfile();
  const isAdmin = profile?.system_role === "admin";

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, description")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Projeler</h1>

      {isAdmin && <ProjectForm />}

      <ul className="space-y-2">
        {(projects ?? []).map((project) => (
          <li key={project.id}>
            <Link
              href={`/projects/${project.id}`}
              className="block rounded-xl border border-border bg-card p-4 shadow-xs transition-all hover:border-ring/40 hover:shadow-sm"
            >
              <span className="break-words font-medium">{project.name}</span>
              {project.description && (
                <p className="mt-1 break-words text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
            </Link>
          </li>
        ))}
        {(projects ?? []).length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Henüz proje yok.
          </li>
        )}
      </ul>
    </div>
  );
}

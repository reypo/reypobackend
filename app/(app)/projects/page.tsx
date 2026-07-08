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
              className="block rounded-lg border border-border p-4 hover:bg-accent"
            >
              <span className="font-medium">{project.name}</span>
              {project.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
            </Link>
          </li>
        ))}
        {(projects ?? []).length === 0 && (
          <li className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
            Henüz proje yok.
          </li>
        )}
      </ul>
    </div>
  );
}

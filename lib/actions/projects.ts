"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./guard";

export type ProjectState = { error?: string } | undefined;

export async function createProject(
  _prevState: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const { supabase, user } = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;

  if (!name) {
    return { error: "Proje adı gerekli." };
  }

  const { error } = await supabase
    .from("projects")
    .insert({ name, description, created_by: user.id });

  if (error) {
    return { error: "Proje oluşturulamadı." };
  }

  // Sidebar'daki proje listesi layout seviyesinde çekiliyor; sadece /projects
  // revalidate edilirse diğer sayfalarda sidebar bayat kalır.
  revalidatePath("/", "layout");
  return undefined;
}

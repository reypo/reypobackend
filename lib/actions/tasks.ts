"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./guard";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TaskPriority } from "@/lib/supabase/types";

export type TaskState = { error?: string } | undefined;

export async function createTask(
  _prevState: TaskState,
  formData: FormData
): Promise<TaskState> {
  const { supabase, user } = await requireAdmin();

  const projectId = String(formData.get("project_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const priority = String(formData.get("priority") ?? "normal") as TaskPriority;
  const dueDate = String(formData.get("due_date") ?? "") || null;
  const assigneeId = String(formData.get("assignee_id") ?? "");
  const roleId = String(formData.get("role_id") ?? "") || null;

  if (!projectId || !title || !assigneeId) {
    return { error: "Başlık ve atanan kişi zorunlu." };
  }

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      title,
      description,
      priority,
      due_date: dueDate,
      assignee_id: assigneeId,
      role_id: roleId,
      created_by: user.id,
    })
    .select("id, title")
    .single();

  if (error || !task) {
    return { error: "Görev oluşturulamadı." };
  }

  // notifications tablosunda authenticated insert policy'si yok (bkz. migration) —
  // atanan kişi admin'den farklı olduğu için bu ekleme RLS'i atlayan admin client ile yapılır.
  await createAdminClient()
    .from("notifications")
    .insert({
      user_id: assigneeId,
      type: "task_assigned",
      title: "Yeni görev atandı",
      body: task.title,
      task_id: task.id,
    });

  revalidatePath(`/projects/${projectId}`);
  return undefined;
}

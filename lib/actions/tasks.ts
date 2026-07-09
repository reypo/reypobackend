"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./guard";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser } from "@/lib/push";
import type { TaskPriority, TaskStatus } from "@/lib/supabase/types";

export type TaskState = { error?: string; success?: boolean } | undefined;

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

  await sendPushToUser(assigneeId, {
    title: "Yeni görev atandı",
    body: task.title,
    taskId: task.id,
  });

  revalidatePath(`/projects/${projectId}`);
  // Başarı bilgisi form panelinin kendini kapatması için kullanılır.
  return { success: true };
}

// Kesinleşen karar: onay akışı yok — "Tamamladım" görevi direkt done yapar (PLAN.md #11).
// Member sadece kendine atanan görevin status'unu değiştirebilir; bu, RLS'in ikinci
// savunma hattı olduğu tasks_update_own_or_admin politikasıyla desteklenir.
export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Oturum açılmamış.");
  }

  const { data: task } = await supabase
    .from("tasks")
    .select("id, project_id, title, assignee_id")
    .eq("id", taskId)
    .single();

  if (!task) {
    throw new Error("Görev bulunamadı.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("system_role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.system_role === "admin";

  if (!isAdmin && task.assignee_id !== user.id) {
    throw new Error("Bu görevi güncelleme yetkiniz yok.");
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      completed_at: status === "done" ? new Date().toISOString() : null,
    })
    .eq("id", taskId);

  if (error) {
    throw new Error("Görev güncellenemedi.");
  }

  if (status === "done") {
    const adminClient = createAdminClient();
    const { data: admins } = await adminClient
      .from("profiles")
      .select("id")
      .eq("system_role", "admin");

    const recipients = (admins ?? []).filter((admin) => admin.id !== user.id);
    if (recipients.length > 0) {
      await adminClient.from("notifications").insert(
        recipients.map((admin) => ({
          user_id: admin.id,
          type: "task_completed" as const,
          title: "Görev tamamlandı",
          body: task.title,
          task_id: task.id,
        }))
      );

      await Promise.all(
        recipients.map((admin) =>
          sendPushToUser(admin.id, {
            title: "Görev tamamlandı",
            body: task.title,
            taskId: task.id,
          })
        )
      );
    }
  }

  revalidatePath("/");
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath(`/projects/${task.project_id}`);
}

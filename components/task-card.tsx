import type { TaskPriority, TaskStatus } from "@/lib/supabase/types";

const statusLabel: Record<TaskStatus, string> = {
  todo: "Bekliyor",
  in_progress: "Devam Ediyor",
  done: "Tamamlandı",
};

const priorityLabel: Record<TaskPriority, string> = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
  urgent: "Acil",
};

export function TaskCard({
  task,
  assigneeName,
}: {
  task: {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    due_date: string | null;
  };
  assigneeName: string;
}) {
  return (
    <li className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium">{task.title}</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
          {statusLabel[task.status]}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
        <span>{assigneeName || "Atanmadı"}</span>
        <span>Öncelik: {priorityLabel[task.priority]}</span>
        {task.due_date && <span>Son tarih: {task.due_date}</span>}
      </div>
    </li>
  );
}

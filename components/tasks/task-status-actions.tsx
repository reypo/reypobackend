"use client";

import { useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { updateTaskStatus } from "@/lib/actions/tasks";
import type { TaskStatus } from "@/lib/supabase/types";

export function TaskStatusActions({
  taskId,
  status,
  canReopen = false,
}: {
  taskId: string;
  status: TaskStatus;
  canReopen?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handle(next: TaskStatus) {
    startTransition(() => updateTaskStatus(taskId, next));
  }

  if (status === "done") {
    if (!canReopen) {
      return null;
    }
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => handle("todo")}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
      >
        <RotateCcw className="h-4 w-4" />
        Yeniden Aç
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      {status === "todo" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => handle("in_progress")}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
        >
          Başladım
        </button>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => handle("done")}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Tamamladım
      </button>
    </div>
  );
}

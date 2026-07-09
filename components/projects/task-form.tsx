"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { createTask, type TaskState } from "@/lib/actions/tasks";

type Assignee = { id: string; label: string; roleId: string | null };

export function TaskForm({
  projectId,
  roles,
  assignees,
  onSuccess,
}: {
  projectId: string;
  roles: { id: string; name: string }[];
  assignees: Assignee[];
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState<TaskState, FormData>(
    createTask,
    undefined
  );
  const [roleFilter, setRoleFilter] = useState("");

  useEffect(() => {
    if (state?.success) {
      onSuccess?.();
    }
  }, [state, onSuccess]);

  const filteredAssignees = useMemo(
    () =>
      roleFilter ? assignees.filter((a) => a.roleId === roleFilter) : assignees,
    [assignees, roleFilter]
  );

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-xs"
    >
      <input type="hidden" name="project_id" value={projectId} />

      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium">
          Başlık
        </label>
        <input
          id="title"
          name="title"
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Açıklama
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="priority" className="text-sm font-medium">
            Öncelik
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="normal"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-base"
          >
            <option value="low">Düşük</option>
            <option value="normal">Normal</option>
            <option value="high">Yüksek</option>
            <option value="urgent">Acil</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="due_date" className="text-sm font-medium">
            Son tarih
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="role_filter" className="text-sm font-medium">
            İş rolüne göre filtrele
          </label>
          <select
            id="role_filter"
            name="role_id"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-base"
          >
            <option value="">Tüm roller</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="assignee_id" className="text-sm font-medium">
            Atanan kişi
          </label>
          <select
            id="assignee_id"
            name="assignee_id"
            required
            defaultValue=""
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-base"
          >
            <option value="" disabled>
              Seçin
            </option>
            {filteredAssignees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {pending ? "Ekleniyor…" : "Görev Ata"}
      </button>
    </form>
  );
}

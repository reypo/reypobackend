"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { TaskForm } from "./task-form";

type Assignee = { id: string; label: string; roleId: string | null };

export function ProjectHeader({
  name,
  description,
  isAdmin,
  projectId,
  roles,
  assignees,
}: {
  name: string;
  description: string | null;
  isAdmin: boolean;
  projectId: string;
  roles: { id: string; name: string }[];
  assignees: Assignee[];
}) {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-lg font-semibold">{name}</h1>
          {description && (
            <p className="mt-1 break-words text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setFormOpen((open) => !open)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              formOpen
                ? "border border-border bg-card text-foreground"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {formOpen ? (
              <>
                <X className="h-4 w-4" />
                Vazgeç
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Yeni Görev Ata
              </>
            )}
          </button>
        )}
      </div>

      {isAdmin && formOpen && (
        <TaskForm
          projectId={projectId}
          roles={roles}
          assignees={assignees}
          onSuccess={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}

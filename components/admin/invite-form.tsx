"use client";

import { useActionState } from "react";
import { inviteUser, type InviteState } from "@/lib/actions/users";

export function InviteForm() {
  const [state, formAction, pending] = useActionState<InviteState, FormData>(
    inviteUser,
    undefined
  );

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-border p-4"
    >
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          E-posta
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="ornek@sirket.com"
          className="rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
      >
        {pending ? "Gönderiliyor…" : "Davet Gönder"}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-destructive">{state.error}</p>
      )}
      {state?.success && (
        <p className="w-full text-sm text-emerald-600">{state.success}</p>
      )}
    </form>
  );
}

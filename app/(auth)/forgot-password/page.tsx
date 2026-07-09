"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/set-password`,
    });

    if (error) {
      setError("Bağlantı gönderilemedi. Lütfen daha sonra tekrar deneyin.");
      setPending(false);
      return;
    }

    setSent(true);
    setPending(false);
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="space-y-2 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-primary text-base font-bold text-primary-foreground">
            G
          </span>
          <h1 className="text-xl font-semibold">Şifre Sıfırlama</h1>
          <p className="text-sm text-muted-foreground">
            E-posta adresinize sıfırlama bağlantısı gönderelim
          </p>
        </div>

        {sent ? (
          <p className="rounded-lg bg-emerald-50 p-3 text-center text-sm text-emerald-700">
            Bu adrese kayıtlı bir hesap varsa sıfırlama bağlantısı gönderildi.
            Gelen kutunuzu kontrol edin.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                E-posta
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Gönderiliyor…" : "Sıfırlama Bağlantısı Gönder"}
            </button>
          </form>
        )}

        <p className="text-center">
          <Link
            href="/login"
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            ← Girişe dön
          </Link>
        </p>
      </div>
    </main>
  );
}

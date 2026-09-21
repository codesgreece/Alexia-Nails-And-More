"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm({
  callbackUrl,
  initialError,
}: {
  callbackUrl: string;
  initialError: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState(initialError);
  const [pending, setPending] = useState(false);
  const dest = callbackUrl.startsWith("/admin") ? callbackUrl : "/admin";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(false);

    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
      redirect: false,
      callbackUrl: dest,
    });

    if (result?.ok) {
      router.push(dest);
      router.refresh();
      return;
    }

    setError(true);
    setPending(false);
  }

  return (
    <>
      {error && (
        <div className="mb-5 rounded-xl border border-pink/20 bg-pink-soft/50 px-4 py-3 text-sm text-pink">
          Λάθος email ή κωδικός πρόσβασης.
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-charcoal">
          Email
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            defaultValue="admin@alexianails.gr"
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-pink"
          />
        </label>
        <label className="block text-sm font-medium text-charcoal">
          Κωδικός
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 outline-none transition focus:border-pink"
          />
        </label>
        <button type="submit" disabled={pending} className="btn-primary mt-2 w-full disabled:opacity-70">
          {pending ? "Σύνδεση..." : "Σύνδεση"}
        </button>
      </form>
    </>
  );
}

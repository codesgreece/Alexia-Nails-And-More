import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { signIn, auth } from "@/lib/auth";

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const callbackUrl = String(formData.get("callbackUrl") || "/admin");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl.startsWith("/admin") ? callbackUrl : "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/admin/login?error=credentials&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    throw error;
  }
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }

  const params = await searchParams;
  const hasError = params.error === "credentials";
  const callbackUrl = params.callbackUrl || "/admin";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(217,27,115,0.12), transparent 40%), radial-gradient(circle at 80% 0%, rgba(145,200,192,0.18), transparent 35%), linear-gradient(160deg, #fff 0%, #faf6f8 55%, #f3eef1 100%)",
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="admin-card px-8 py-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <Image
              src="/images/alexia-logo.png"
              alt="Alexia Nails & More"
              width={88}
              height={88}
              className="mb-4 rounded-full object-contain"
              priority
            />
            <p className="font-display text-3xl text-charcoal">Alexia Nails & More</p>
            <p className="mt-2 text-sm tracking-[0.2em] text-pink uppercase">Admin Panel</p>
          </div>

          {hasError && (
            <div className="mb-5 rounded-xl border border-pink/20 bg-pink-soft/50 px-4 py-3 text-sm text-pink">
              Λάθος email ή κωδικός πρόσβασης.
            </div>
          )}

          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
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
            <button type="submit" className="btn-primary mt-2 w-full">
              Σύνδεση
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

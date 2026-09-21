import { redirect } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

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

          <AdminLoginForm
            callbackUrl={callbackUrl}
            initialError={params.error === "credentials"}
          />
        </div>
      </div>
    </div>
  );
}

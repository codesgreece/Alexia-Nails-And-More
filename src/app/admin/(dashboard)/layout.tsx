import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const settings = await prisma.businessSettings.findUnique({ where: { id: "main" } });

  return (
    <AdminShell adminName={session.user.name} logoUrl={settings?.logoUrl}>
      {children}
    </AdminShell>
  );
}

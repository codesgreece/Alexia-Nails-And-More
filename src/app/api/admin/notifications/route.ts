import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const notifications = await prisma.notification.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      appointment: {
        select: {
          id: true,
          confirmationCode: true,
          startAt: true,
        },
      },
    },
    take: 200,
  });

  return NextResponse.json({ notifications });
}

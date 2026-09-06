import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId");

  if (!serviceId) {
    return NextResponse.json({ error: "Απαιτείται serviceId." }, { status: 400 });
  }

  const links = await prisma.staffService.findMany({
    where: {
      serviceId,
      staff: { status: "ACTIVE" },
    },
    include: {
      staff: {
        select: {
          id: true,
          name: true,
          slug: true,
          photoUrl: true,
          bio: true,
          color: true,
          specialties: true,
        },
      },
    },
    orderBy: { staff: { displayOrder: "asc" } },
  });

  return NextResponse.json({ staff: links.map((l) => l.staff) });
}

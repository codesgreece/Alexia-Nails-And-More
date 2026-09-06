import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      services: {
        where: { status: "ACTIVE" },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          durationMin: true,
          icon: true,
          imageUrl: true,
          displayOrder: true,
          categoryId: true,
        },
      },
    },
  });

  return NextResponse.json({ categories });
}

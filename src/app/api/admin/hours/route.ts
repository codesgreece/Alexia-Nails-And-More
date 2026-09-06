import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hours = await prisma.openingHour.findMany({ orderBy: { dayOfWeek: "asc" } });
  return NextResponse.json({ hours });
}

const itemSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isClosed: z.boolean(),
  openTime: z.string().nullable().optional(),
  closeTime: z.string().nullable().optional(),
});

export async function PUT(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = z.array(itemSchema).safeParse(body.hours ?? body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Μη έγκυρα στοιχεία." }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.map((h) =>
      prisma.openingHour.upsert({
        where: { dayOfWeek: h.dayOfWeek },
        create: {
          dayOfWeek: h.dayOfWeek,
          isClosed: h.isClosed,
          openTime: h.isClosed ? null : h.openTime || null,
          closeTime: h.isClosed ? null : h.closeTime || null,
        },
        update: {
          isClosed: h.isClosed,
          openTime: h.isClosed ? null : h.openTime || null,
          closeTime: h.isClosed ? null : h.closeTime || null,
        },
      })
    )
  );

  const hours = await prisma.openingHour.findMany({ orderBy: { dayOfWeek: "asc" } });
  return NextResponse.json({ hours });
}

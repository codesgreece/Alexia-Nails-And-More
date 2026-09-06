import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const specialHours = await prisma.specialHour.findMany({
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ specialHours });
}

const schema = z.object({
  date: z.string(),
  isClosed: z.boolean(),
  openTime: z.string().nullable().optional(),
  closeTime: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Μη έγκυρα στοιχεία." }, { status: 400 });
  }

  const data = parsed.data;
  const specialHour = await prisma.specialHour.create({
    data: {
      date: new Date(data.date),
      isClosed: data.isClosed,
      openTime: data.isClosed ? null : data.openTime || null,
      closeTime: data.isClosed ? null : data.closeTime || null,
      reason: data.reason || null,
    },
  });

  return NextResponse.json({ specialHour });
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Απαιτείται id." }, { status: 400 });

  await prisma.specialHour.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

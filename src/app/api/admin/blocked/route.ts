import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const blocked = await prisma.blockedDate.findMany({
    where: { staffId: null },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ blocked });
}

const schema = z.object({
  date: z.string(),
  endDate: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  allDay: z.boolean().optional(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
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
  const blocked = await prisma.blockedDate.create({
    data: {
      date: new Date(data.date),
      endDate: data.endDate ? new Date(data.endDate) : null,
      reason: data.reason || null,
      allDay: data.allDay ?? true,
      startTime: data.startTime || null,
      endTime: data.endTime || null,
      staffId: null,
    },
  });

  return NextResponse.json({ blocked });
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Απαιτείται id." }, { status: 400 });

  await prisma.blockedDate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

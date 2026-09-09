import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  updates: z
    .array(
      z.object({
        id: z.string().min(1),
        durationMin: z.number().int().min(0),
      })
    )
    .min(1),
});

/** Bulk-update service durations from the admin durations panel. */
export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Μη έγκυρα στοιχεία." }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.updates.map((u) =>
      prisma.service.update({
        where: { id: u.id },
        data: { durationMin: u.durationMin },
      })
    )
  );

  return NextResponse.json({ ok: true, count: parsed.data.updates.length });
}

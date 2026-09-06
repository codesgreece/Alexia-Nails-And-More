import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  authorName: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  content: z.string().min(1).optional(),
  source: z.string().optional(),
  sourceUrl: z.string().nullable().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Μη έγκυρα στοιχεία." }, { status: 400 });
  }

  const review = await prisma.review.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ review });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

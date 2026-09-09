import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  durationMin: z.number().int().min(0).optional(),
  icon: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  displayOrder: z.number().int().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  categoryId: z.string().optional(),
  staffIds: z.array(z.string()).optional(),
});

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Μη έγκυρα στοιχεία." }, { status: 400 });
  }

  const data = parsed.data;

  if (data.staffIds) {
    await prisma.staffService.deleteMany({ where: { serviceId: id } });
    if (data.staffIds.length) {
      await prisma.staffService.createMany({
        data: data.staffIds.map((staffId) => ({ staffId, serviceId: id })),
      });
    }
  }

  const service = await prisma.service.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.slug || data.name
        ? { slug: data.slug || slugify(data.name || existing.name) }
        : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.durationMin !== undefined ? { durationMin: data.durationMin } : {}),
      ...(data.icon !== undefined ? { icon: data.icon } : {}),
      ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.categoryId ? { categoryId: data.categoryId } : {}),
    },
    include: {
      category: true,
      staff: { include: { staff: true } },
    },
  });

  return NextResponse.json({ service });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await prisma.service.update({
    where: { id },
    data: { status: "INACTIVE" },
  });

  return NextResponse.json({ ok: true });
}

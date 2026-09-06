import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await prisma.serviceCategory.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { services: true } } },
  });

  return NextResponse.json({ categories });
}

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  displayOrder: z.number().int().optional(),
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
  const category = await prisma.serviceCategory.create({
    data: {
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description || null,
      displayOrder: data.displayOrder ?? 0,
    },
  });

  return NextResponse.json({ category });
}

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const id = body.id as string | undefined;
  if (!id) return NextResponse.json({ error: "Απαιτείται id." }, { status: 400 });

  const parsed = schema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Μη έγκυρα στοιχεία." }, { status: 400 });
  }

  const data = parsed.data;
  const category = await prisma.serviceCategory.update({
    where: { id },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.slug || data.name
        ? { slug: data.slug || slugify(data.name || "") }
        : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
    },
  });

  return NextResponse.json({ category });
}

export async function DELETE(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Απαιτείται id." }, { status: 400 });

  await prisma.serviceCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

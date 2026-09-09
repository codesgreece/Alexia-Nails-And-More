import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const services = await prisma.service.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      category: true,
      staff: { include: { staff: true } },
    },
  });

  return NextResponse.json({ services });
}

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  durationMin: z.number().int().min(0),
  icon: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  displayOrder: z.number().int().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  categoryId: z.string().min(1),
  staffIds: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Μη έγκυρα στοιχεία." }, { status: 400 });
  }

  const data = parsed.data;
  const service = await prisma.service.create({
    data: {
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description || null,
      durationMin: data.durationMin,
      icon: data.icon || null,
      imageUrl: data.imageUrl || null,
      displayOrder: data.displayOrder ?? 0,
      status: data.status || "ACTIVE",
      categoryId: data.categoryId,
      staff: data.staffIds
        ? { create: data.staffIds.map((staffId) => ({ staffId })) }
        : undefined,
    },
    include: {
      category: true,
      staff: { include: { staff: true } },
    },
  });

  return NextResponse.json({ service });
}

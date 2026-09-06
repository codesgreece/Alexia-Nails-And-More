import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const images = await prisma.galleryImage.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ images });
}

const schema = z.object({
  title: z.string().nullable().optional(),
  alt: z.string().nullable().optional(),
  imageUrl: z.string().min(1),
  category: z.string().optional(),
  featured: z.boolean().optional(),
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
  const maxOrder = await prisma.galleryImage.aggregate({ _max: { displayOrder: true } });
  const image = await prisma.galleryImage.create({
    data: {
      title: data.title || null,
      alt: data.alt || null,
      imageUrl: data.imageUrl,
      category: data.category || "Nails",
      featured: data.featured ?? false,
      displayOrder: data.displayOrder ?? (maxOrder._max.displayOrder ?? 0) + 1,
    },
  });

  return NextResponse.json({ image });
}

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  if (Array.isArray(body.order)) {
    await prisma.$transaction(
      body.order.map((id: string, index: number) =>
        prisma.galleryImage.update({
          where: { id },
          data: { displayOrder: index + 1 },
        })
      )
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Μη έγκυρο αίτημα." }, { status: 400 });
}

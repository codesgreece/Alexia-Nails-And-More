import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reviews = await prisma.review.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ reviews });
}

const schema = z.object({
  authorName: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(1),
  source: z.string().optional(),
  sourceUrl: z.string().nullable().optional(),
  published: z.boolean().optional(),
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
  const review = await prisma.review.create({
    data: {
      authorName: data.authorName,
      rating: data.rating,
      content: data.content,
      source: data.source || "ADMIN",
      sourceUrl: data.sourceUrl || null,
      published: data.published ?? false,
      featured: data.featured ?? false,
      displayOrder: data.displayOrder ?? 0,
    },
  });

  return NextResponse.json({ review });
}

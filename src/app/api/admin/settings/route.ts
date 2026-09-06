import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.businessSettings.findUnique({ where: { id: "main" } });
  return NextResponse.json({ settings });
}

const schema = z.object({
  businessName: z.string().optional(),
  ownerName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  instagramUrl: z.string().optional(),
  instagramHandle: z.string().optional(),
  facebookUrl: z.string().nullable().optional(),
  whatsappNumber: z.string().nullable().optional(),
  logoUrl: z.string().optional(),
  heroEyebrow: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroImageUrl: z.string().optional(),
  aboutTitle: z.string().optional(),
  aboutText: z.string().optional(),
  brandStatement: z.string().optional(),
  mapEmbedUrl: z.string().optional(),
  mapsDirectionsUrl: z.string().optional(),
  bookingSlotMinutes: z.number().int().positive().optional(),
  bookingLeadHours: z.number().int().min(0).optional(),
  bookingMaxDays: z.number().int().positive().optional(),
  emailNotifications: z.boolean().optional(),
  smtpConfigured: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Μη έγκυρα στοιχεία." }, { status: 400 });
  }

  const settings = await prisma.businessSettings.upsert({
    where: { id: "main" },
    create: { id: "main", ...parsed.data },
    update: parsed.data,
  });

  return NextResponse.json({ settings });
}

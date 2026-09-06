import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const staff = await prisma.staff.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      services: { include: { service: true } },
      schedules: { orderBy: { dayOfWeek: "asc" } },
      breaks: true,
      vacations: true,
      blockedDates: true,
    },
  });

  return NextResponse.json({ staff });
}

const scheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isOff: z.boolean(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
});

const breakSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string(),
  endTime: z.string(),
  label: z.string().nullable().optional(),
});

const vacationSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().nullable().optional(),
});

const blockedSchema = z.object({
  date: z.string(),
  endDate: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  allDay: z.boolean().optional(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
});

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  photoUrl: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  specialties: z.string().nullable().optional(),
  color: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  displayOrder: z.number().int().optional(),
  serviceIds: z.array(z.string()).optional(),
  schedules: z.array(scheduleSchema).optional(),
  breaks: z.array(breakSchema).optional(),
  vacations: z.array(vacationSchema).optional(),
  blockedDates: z.array(blockedSchema).optional(),
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
  const slug = data.slug || slugify(data.name);

  const staff = await prisma.staff.create({
    data: {
      name: data.name,
      slug,
      photoUrl: data.photoUrl || null,
      bio: data.bio || null,
      specialties: data.specialties || null,
      color: data.color || "#D91B73",
      status: data.status || "ACTIVE",
      displayOrder: data.displayOrder ?? 0,
      services: data.serviceIds
        ? { create: data.serviceIds.map((serviceId) => ({ serviceId })) }
        : undefined,
      schedules: data.schedules
        ? {
            create: data.schedules.map((s) => ({
              dayOfWeek: s.dayOfWeek,
              isOff: s.isOff,
              startTime: s.startTime || null,
              endTime: s.endTime || null,
            })),
          }
        : undefined,
      breaks: data.breaks
        ? {
            create: data.breaks.map((b) => ({
              dayOfWeek: b.dayOfWeek,
              startTime: b.startTime,
              endTime: b.endTime,
              label: b.label || null,
            })),
          }
        : undefined,
      vacations: data.vacations
        ? {
            create: data.vacations.map((v) => ({
              startDate: new Date(v.startDate),
              endDate: new Date(v.endDate),
              reason: v.reason || null,
            })),
          }
        : undefined,
      blockedDates: data.blockedDates
        ? {
            create: data.blockedDates.map((b) => ({
              date: new Date(b.date),
              endDate: b.endDate ? new Date(b.endDate) : null,
              reason: b.reason || null,
              allDay: b.allDay ?? true,
              startTime: b.startTime || null,
              endTime: b.endTime || null,
            })),
          }
        : undefined,
    },
    include: {
      services: { include: { service: true } },
      schedules: true,
      breaks: true,
      vacations: true,
      blockedDates: true,
    },
  });

  return NextResponse.json({ staff });
}

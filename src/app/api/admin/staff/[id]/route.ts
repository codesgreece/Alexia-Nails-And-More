import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

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

const patchSchema = z.object({
  name: z.string().min(1).optional(),
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

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const existing = await prisma.staff.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Μη έγκυρα στοιχεία." }, { status: 400 });
  }

  const data = parsed.data;

  await prisma.$transaction(async (tx) => {
    if (data.serviceIds) {
      await tx.staffService.deleteMany({ where: { staffId: id } });
      if (data.serviceIds.length) {
        await tx.staffService.createMany({
          data: data.serviceIds.map((serviceId) => ({ staffId: id, serviceId })),
        });
      }
    }

    if (data.schedules) {
      await tx.staffSchedule.deleteMany({ where: { staffId: id } });
      if (data.schedules.length) {
        await tx.staffSchedule.createMany({
          data: data.schedules.map((s) => ({
            staffId: id,
            dayOfWeek: s.dayOfWeek,
            isOff: s.isOff,
            startTime: s.startTime || null,
            endTime: s.endTime || null,
          })),
        });
      }
    }

    if (data.breaks) {
      await tx.staffBreak.deleteMany({ where: { staffId: id } });
      if (data.breaks.length) {
        await tx.staffBreak.createMany({
          data: data.breaks.map((b) => ({
            staffId: id,
            dayOfWeek: b.dayOfWeek,
            startTime: b.startTime,
            endTime: b.endTime,
            label: b.label || null,
          })),
        });
      }
    }

    if (data.vacations) {
      await tx.staffVacation.deleteMany({ where: { staffId: id } });
      if (data.vacations.length) {
        await tx.staffVacation.createMany({
          data: data.vacations.map((v) => ({
            staffId: id,
            startDate: new Date(v.startDate),
            endDate: new Date(v.endDate),
            reason: v.reason || null,
          })),
        });
      }
    }

    if (data.blockedDates) {
      await tx.blockedDate.deleteMany({ where: { staffId: id } });
      if (data.blockedDates.length) {
        await tx.blockedDate.createMany({
          data: data.blockedDates.map((b) => ({
            staffId: id,
            date: new Date(b.date),
            endDate: b.endDate ? new Date(b.endDate) : null,
            reason: b.reason || null,
            allDay: b.allDay ?? true,
            startTime: b.startTime || null,
            endTime: b.endTime || null,
          })),
        });
      }
    }

    await tx.staff.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.slug || data.name
          ? { slug: data.slug || slugify(data.name || existing.name) }
          : {}),
        ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.specialties !== undefined ? { specialties: data.specialties } : {}),
        ...(data.color ? { color: data.color } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.displayOrder !== undefined ? { displayOrder: data.displayOrder } : {}),
      },
    });
  });

  const staff = await prisma.staff.findUnique({
    where: { id },
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

export async function DELETE(_request: Request, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  await prisma.staff.update({
    where: { id },
    data: { status: "INACTIVE" },
  });

  return NextResponse.json({ ok: true });
}

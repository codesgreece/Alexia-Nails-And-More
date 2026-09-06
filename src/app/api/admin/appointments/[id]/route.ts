import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSlotAvailable } from "@/lib/availability";
import {
  notifyCancellation,
  notifyReschedule,
  scheduleReminders,
} from "@/lib/notifications";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  startAt: z.string().datetime().optional(),
  staffId: z.string().optional(),
  serviceId: z.string().optional(),
  notes: z.string().nullable().optional(),
  adminNotes: z.string().nullable().optional(),
});

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Μη έγκυρα στοιχεία." }, { status: 400 });
  }

  const data = parsed.data;
  const nextStaffId = data.staffId || existing.staffId;
  const nextServiceId = data.serviceId || existing.serviceId;
  let nextStart = existing.startAt;
  let nextEnd = existing.endAt;

  const isReschedule =
    Boolean(data.startAt) ||
    Boolean(data.staffId && data.staffId !== existing.staffId) ||
    Boolean(data.serviceId && data.serviceId !== existing.serviceId);

  if (isReschedule) {
    nextStart = data.startAt ? new Date(data.startAt) : existing.startAt;
    const availability = await assertSlotAvailable({
      serviceId: nextServiceId,
      staffId: nextStaffId,
      startAt: nextStart,
      excludeAppointmentId: id,
    });
    if (!availability.ok) {
      return NextResponse.json({ error: availability.error }, { status: 409 });
    }
    nextEnd = availability.endAt;
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      ...(data.status ? { status: data.status } : {}),
      ...(isReschedule
        ? {
            startAt: nextStart,
            endAt: nextEnd,
            staffId: nextStaffId,
            serviceId: nextServiceId,
          }
        : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
      ...(data.adminNotes !== undefined ? { adminNotes: data.adminNotes } : {}),
    },
    include: { customer: true, staff: true, service: true },
  });

  if (data.status === "CANCELLED" && existing.status !== "CANCELLED") {
    await notifyCancellation(id);
  } else if (isReschedule) {
    await notifyReschedule(id);
    await scheduleReminders(id);
  }

  return NextResponse.json({ appointment });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });
  }

  await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  await notifyCancellation(id);

  return NextResponse.json({ ok: true });
}

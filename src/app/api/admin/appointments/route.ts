import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSlotAvailable } from "@/lib/availability";
import { generateConfirmationCode } from "@/lib/utils";
import { notifyBookingCreated, scheduleReminders } from "@/lib/notifications";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const staffId = searchParams.get("staffId");

  const appointments = await prisma.appointment.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(staffId ? { staffId } : {}),
      ...(from || to
        ? {
            startAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { startAt: "desc" },
    include: {
      customer: true,
      staff: true,
      service: true,
    },
    take: 500,
  });

  return NextResponse.json({ appointments });
}

const createSchema = z.object({
  serviceId: z.string().min(1),
  staffId: z.string().min(1),
  startAt: z.string().datetime(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  notes: z.string().optional().nullable(),
  adminNotes: z.string().optional().nullable(),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  customerId: z.string().optional(),
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
  const startAt = new Date(data.startAt);
  const availability = await assertSlotAvailable({
    serviceId: data.serviceId,
    staffId: data.staffId,
    startAt,
  });
  if (!availability.ok) {
    return NextResponse.json({ error: availability.error }, { status: 409 });
  }

  let customerId = data.customerId;
  if (!customerId) {
    const existing = await prisma.customer.findFirst({ where: { phone: data.phone } });
    if (existing) {
      customerId = existing.id;
      await prisma.customer.update({
        where: { id: existing.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email || existing.email,
        },
      });
    } else {
      const created = await prisma.customer.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email || null,
        },
      });
      customerId = created.id;
    }
  }

  const appointment = await prisma.appointment.create({
    data: {
      confirmationCode: generateConfirmationCode(),
      status: data.status || "CONFIRMED",
      startAt,
      endAt: availability.endAt,
      notes: data.notes || null,
      adminNotes: data.adminNotes || null,
      customerId,
      staffId: data.staffId,
      serviceId: data.serviceId,
    },
    include: { customer: true, staff: true, service: true },
  });

  await notifyBookingCreated(appointment.id);
  await scheduleReminders(appointment.id);

  return NextResponse.json({ appointment });
}

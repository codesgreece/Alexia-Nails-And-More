import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertSlotAvailable } from "@/lib/availability";
import { parseBookingStart } from "@/lib/time";
import { generateConfirmationCode } from "@/lib/utils";
import { notifyBookingCreated, scheduleReminders } from "@/lib/notifications";

const schema = z.object({
  serviceId: z.string().min(1),
  staffId: z.string().min(1),
  startAt: z.string().min(10),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Μη έγκυρο αίτημα." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ελλιπή ή μη έγκυρα στοιχεία." }, { status: 400 });
  }

  const data = parsed.data;
  const startAt = parseBookingStart(data.startAt);
  if (Number.isNaN(startAt.getTime())) {
    return NextResponse.json({ error: "Μη έγκυρη ώρα ραντεβού." }, { status: 400 });
  }

  const availability = await assertSlotAvailable({
    serviceId: data.serviceId,
    staffId: data.staffId,
    startAt,
  });

  if (!availability.ok) {
    return NextResponse.json({ error: availability.error }, { status: 409 });
  }

  let customer = await prisma.customer.findFirst({
    where: {
      phone: data.phone,
      ...(data.email ? { email: data.email } : {}),
    },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email || null,
      },
    });
  } else {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || customer.email,
      },
    });
  }

  const appointment = await prisma.appointment.create({
    data: {
      confirmationCode: generateConfirmationCode(),
      status: "PENDING",
      startAt,
      endAt: availability.endAt,
      notes: data.notes || null,
      customerId: customer.id,
      staffId: data.staffId,
      serviceId: data.serviceId,
    },
    include: {
      customer: true,
      staff: true,
      service: true,
    },
  });

  await notifyBookingCreated(appointment.id);
  await scheduleReminders(appointment.id);

  return NextResponse.json({
    appointment: {
      id: appointment.id,
      confirmationCode: appointment.confirmationCode,
      startAt: appointment.startAt,
      endAt: appointment.endAt,
      status: appointment.status,
      service: appointment.service.name,
      staff: appointment.staff.name,
    },
  });
}

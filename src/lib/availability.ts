import {
  addMinutes,
  areIntervalsOverlapping,
  endOfDay,
  format,
  isBefore,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { prisma } from "./prisma";
import { minutesToTime, parseTimeToMinutes } from "./utils";

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED"];

export type AvailabilitySlot = {
  start: string; // ISO
  end: string;
  label: string; // HH:mm
};

function combineDateAndTime(date: Date, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  return setMinutes(setHours(startOfDay(date), h), m);
}

export async function getAvailableSlots(params: {
  serviceId: string;
  staffId: string;
  date: string; // YYYY-MM-DD
}): Promise<AvailabilitySlot[]> {
  const { serviceId, staffId, date } = params;
  const day = startOfDay(new Date(`${date}T12:00:00`));
  const dayOfWeek = day.getDay();

  const [service, staff, settings, openingHour, specialHour, staffSchedule] =
    await Promise.all([
      prisma.service.findUnique({ where: { id: serviceId } }),
      prisma.staff.findUnique({
        where: { id: staffId },
        include: {
          services: true,
          breaks: true,
          vacations: true,
          blockedDates: true,
        },
      }),
      prisma.businessSettings.findUnique({ where: { id: "main" } }),
      prisma.openingHour.findUnique({ where: { dayOfWeek } }),
      prisma.specialHour.findFirst({
        where: {
          date: {
            gte: startOfDay(day),
            lte: endOfDay(day),
          },
        },
      }),
      prisma.staffSchedule.findUnique({
        where: { staffId_dayOfWeek: { staffId, dayOfWeek } },
      }),
    ]);

  if (!service || service.status !== "ACTIVE") return [];
  if (!staff || staff.status !== "ACTIVE") return [];
  if (!staff.services.some((s) => s.serviceId === serviceId)) return [];

  const slotStep = settings?.bookingSlotMinutes ?? 15;
  const leadHours = settings?.bookingLeadHours ?? 2;
  const duration = service.durationMin;

  // Business closed / Sunday
  if (specialHour?.isClosed) return [];
  if (!specialHour && (!openingHour || openingHour.isClosed)) return [];

  // Staff off / vacation
  if (!staffSchedule || staffSchedule.isOff) return [];
  const onVacation = staff.vacations.some(
    (v) => day >= startOfDay(v.startDate) && day <= endOfDay(v.endDate)
  );
  if (onVacation) return [];

  // Blocked dates (business-wide or staff)
  const blocked = await prisma.blockedDate.findMany({
    where: {
      OR: [{ staffId: null }, { staffId }],
      date: { lte: endOfDay(day) },
      AND: [
        {
          OR: [{ endDate: null }, { endDate: { gte: startOfDay(day) } }],
        },
      ],
    },
  });

  const allDayBlocked = blocked.some((b) => {
    const start = startOfDay(b.date);
    const end = b.endDate ? endOfDay(b.endDate) : endOfDay(b.date);
    return day >= start && day <= end && b.allDay;
  });
  if (allDayBlocked) return [];

  let openTime =
    specialHour?.openTime ||
    openingHour?.openTime ||
    staffSchedule.startTime ||
    "09:00";
  let closeTime =
    specialHour?.closeTime ||
    openingHour?.closeTime ||
    staffSchedule.endTime ||
    "17:00";

  // Intersect with staff schedule
  if (staffSchedule.startTime && staffSchedule.endTime) {
    if (parseTimeToMinutes(staffSchedule.startTime) > parseTimeToMinutes(openTime)) {
      openTime = staffSchedule.startTime;
    }
    if (parseTimeToMinutes(staffSchedule.endTime) < parseTimeToMinutes(closeTime)) {
      closeTime = staffSchedule.endTime;
    }
  }

  const windowStart = combineDateAndTime(day, openTime);
  const windowEnd = combineDateAndTime(day, closeTime);
  const now = new Date();
  const earliest = addMinutes(now, leadHours * 60);

  const appointments = await prisma.appointment.findMany({
    where: {
      staffId,
      status: { in: ACTIVE_STATUSES },
      startAt: { lt: windowEnd },
      endAt: { gt: windowStart },
    },
  });

  const staffBreaks = staff.breaks.filter((b) => b.dayOfWeek === dayOfWeek);
  const partialBlocks = blocked.filter((b) => !b.allDay && b.startTime && b.endTime);

  const slots: AvailabilitySlot[] = [];
  let cursor = windowStart;

  while (true) {
    const slotEnd = addMinutes(cursor, duration);
    if (slotEnd > windowEnd) break;

    const tooEarly = isBefore(cursor, earliest);
    const overlapsAppt = appointments.some((a) =>
      areIntervalsOverlapping(
        { start: cursor, end: slotEnd },
        { start: a.startAt, end: a.endAt },
        { inclusive: false }
      )
    );

    const overlapsBreak = staffBreaks.some((br) => {
      const bStart = combineDateAndTime(day, br.startTime);
      const bEnd = combineDateAndTime(day, br.endTime);
      return areIntervalsOverlapping(
        { start: cursor, end: slotEnd },
        { start: bStart, end: bEnd },
        { inclusive: false }
      );
    });

    const overlapsBlock = partialBlocks.some((b) => {
      const bStart = combineDateAndTime(day, b.startTime!);
      const bEnd = combineDateAndTime(day, b.endTime!);
      return areIntervalsOverlapping(
        { start: cursor, end: slotEnd },
        { start: bStart, end: bEnd },
        { inclusive: false }
      );
    });

    if (!tooEarly && !overlapsAppt && !overlapsBreak && !overlapsBlock) {
      slots.push({
        start: cursor.toISOString(),
        end: slotEnd.toISOString(),
        label: format(cursor, "HH:mm"),
      });
    }

    cursor = addMinutes(cursor, slotStep);
  }

  return slots;
}

export async function assertSlotAvailable(params: {
  serviceId: string;
  staffId: string;
  startAt: Date;
  excludeAppointmentId?: string;
}): Promise<{ ok: true; endAt: Date } | { ok: false; error: string }> {
  const service = await prisma.service.findUnique({
    where: { id: params.serviceId },
  });
  if (!service || service.status !== "ACTIVE") {
    return { ok: false, error: "Η υπηρεσία δεν είναι διαθέσιμη." };
  }

  const endAt = addMinutes(params.startAt, service.durationMin);
  const date = format(params.startAt, "yyyy-MM-dd");
  const slots = await getAvailableSlots({
    serviceId: params.serviceId,
    staffId: params.staffId,
    date,
  });

  const match = slots.find(
    (s) => new Date(s.start).getTime() === params.startAt.getTime()
  );

  if (!match) {
    // If rescheduling, allow current slot if only conflict is itself
    if (params.excludeAppointmentId) {
      const conflict = await prisma.appointment.findFirst({
        where: {
          id: { not: params.excludeAppointmentId },
          staffId: params.staffId,
          status: { in: ACTIVE_STATUSES },
          startAt: { lt: endAt },
          endAt: { gt: params.startAt },
        },
      });
      if (!conflict) {
        return { ok: true, endAt };
      }
    }
    return { ok: false, error: "Η επιλεγμένη ώρα δεν είναι διαθέσιμη." };
  }

  // Race-condition guard: check again for overlapping appointments
  const race = await prisma.appointment.findFirst({
    where: {
      staffId: params.staffId,
      status: { in: ACTIVE_STATUSES },
      startAt: { lt: endAt },
      endAt: { gt: params.startAt },
      ...(params.excludeAppointmentId
        ? { id: { not: params.excludeAppointmentId } }
        : {}),
    },
  });

  if (race) {
    return { ok: false, error: "Η ώρα μόλις κλείστηκε. Επιλέξτε άλλη." };
  }

  return { ok: true, endAt };
}

export function slotLabelRange(start: Date, end: Date) {
  return `${minutesToTime(start.getHours() * 60 + start.getMinutes())} – ${minutesToTime(end.getHours() * 60 + end.getMinutes())}`;
}

import { addMinutes, areIntervalsOverlapping } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { prisma } from "./prisma";
import { parseTimeToMinutes } from "./utils";
import {
  BUSINESS_TZ,
  athensDateTimeToUtc,
  athensDayBounds,
  formatAthens,
} from "./time";

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED"] as const;

export type AvailabilitySlot = {
  start: string; // ISO UTC
  end: string;
  label: string; // HH:mm in Athens
};

export type BusySlot = {
  start: string;
  end: string;
  label: string;
  endLabel: string;
};

export type StaffAlternative = {
  staffId: string;
  staffName: string;
  color: string;
  slotsCount: number;
  nextLabel: string | null;
};

function jsDayOfWeekAthens(date: string): number {
  const iso = Number(
    formatInTimeZone(athensDateTimeToUtc(date, "12:00"), BUSINESS_TZ, "i")
  );
  return iso === 7 ? 0 : iso;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return areIntervalsOverlapping(
    { start: aStart, end: aEnd },
    { start: bStart, end: bEnd },
    { inclusive: false }
  );
}

/**
 * Free start times for a service + staff on an Athens calendar day.
 * Existing appointment [T, T+D) blocks every candidate whose service window
 * overlaps that range (09:00–10:00 hides 09:00 / 09:15 / 09:30 / 09:45).
 */
export async function getAvailableSlots(params: {
  serviceId: string;
  staffId: string;
  date: string;
  excludeAppointmentId?: string;
}): Promise<AvailabilitySlot[]> {
  return (await getDaySchedule(params)).available;
}

export async function getDaySchedule(params: {
  serviceId: string;
  staffId: string;
  date: string;
  excludeAppointmentId?: string;
}): Promise<{
  available: AvailabilitySlot[];
  busy: BusySlot[];
  durationMin: number;
}> {
  const { serviceId, staffId, date, excludeAppointmentId } = params;
  const empty = {
    available: [] as AvailabilitySlot[],
    busy: [] as BusySlot[],
    durationMin: 0,
  };

  const dayOfWeek = jsDayOfWeekAthens(date);
  const { start: dayStart, end: dayEnd } = athensDayBounds(date);

  const [service, staff, settings, openingHour, specialHour, staffSchedule] =
    await Promise.all([
      prisma.service.findUnique({ where: { id: serviceId } }),
      prisma.staff.findUnique({
        where: { id: staffId },
        include: { services: true, breaks: true, vacations: true },
      }),
      prisma.businessSettings.findUnique({ where: { id: "main" } }),
      prisma.openingHour.findUnique({ where: { dayOfWeek } }),
      prisma.specialHour.findFirst({
        where: { date: { gte: dayStart, lte: dayEnd } },
      }),
      prisma.staffSchedule.findUnique({
        where: { staffId_dayOfWeek: { staffId, dayOfWeek } },
      }),
    ]);

  if (!service || service.status !== "ACTIVE") return empty;
  if (!staff || staff.status !== "ACTIVE") return empty;
  if (!staff.services.some((s) => s.serviceId === serviceId)) return empty;

  const slotStep = settings?.bookingSlotMinutes ?? 15;
  const leadHours = settings?.bookingLeadHours ?? 2;
  const durationMin = service.durationMin;
  if (durationMin <= 0) return { ...empty, durationMin };

  if (specialHour?.isClosed) return { ...empty, durationMin };
  if (!specialHour && (!openingHour || openingHour.isClosed)) {
    return { ...empty, durationMin };
  }
  if (!staffSchedule || staffSchedule.isOff) return { ...empty, durationMin };

  const onVacation = staff.vacations.some(
    (v) => v.startDate <= dayEnd && v.endDate >= dayStart
  );
  if (onVacation) return { ...empty, durationMin };

  const blocked = await prisma.blockedDate.findMany({
    where: {
      OR: [{ staffId: null }, { staffId }],
      date: { lte: dayEnd },
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: dayStart } }] }],
    },
  });

  const allDayBlocked = blocked.some((b) => {
    const start = b.date;
    const end = b.endDate ?? b.date;
    return start <= dayEnd && end >= dayStart && b.allDay;
  });
  if (allDayBlocked) return { ...empty, durationMin };

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

  if (staffSchedule.startTime && staffSchedule.endTime) {
    if (parseTimeToMinutes(staffSchedule.startTime) > parseTimeToMinutes(openTime)) {
      openTime = staffSchedule.startTime;
    }
    if (parseTimeToMinutes(staffSchedule.endTime) < parseTimeToMinutes(closeTime)) {
      closeTime = staffSchedule.endTime;
    }
  }

  const windowStart = athensDateTimeToUtc(date, openTime);
  const windowEnd = athensDateTimeToUtc(date, closeTime);
  const earliest = addMinutes(new Date(), leadHours * 60);

  const appointments = await prisma.appointment.findMany({
    where: {
      staffId,
      status: { in: [...ACTIVE_STATUSES] },
      startAt: { lt: windowEnd },
      endAt: { gt: windowStart },
      ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
    },
    orderBy: { startAt: "asc" },
  });

  const busy: BusySlot[] = appointments.map((a) => ({
    start: a.startAt.toISOString(),
    end: a.endAt.toISOString(),
    label: formatAthens(a.startAt, "HH:mm"),
    endLabel: formatAthens(a.endAt, "HH:mm"),
  }));

  const staffBreaks = staff.breaks.filter((b) => b.dayOfWeek === dayOfWeek);
  const partialBlocks = blocked.filter((b) => !b.allDay && b.startTime && b.endTime);

  const available: AvailabilitySlot[] = [];
  let cursor = windowStart;

  while (true) {
    const slotEnd = addMinutes(cursor, durationMin);
    if (slotEnd > windowEnd) break;

    const tooEarly = cursor < earliest;
    const overlapsAppt = appointments.some((a) =>
      overlaps(cursor, slotEnd, a.startAt, a.endAt)
    );
    const overlapsBreak = staffBreaks.some((br) => {
      const bStart = athensDateTimeToUtc(date, br.startTime);
      const bEnd = athensDateTimeToUtc(date, br.endTime);
      return overlaps(cursor, slotEnd, bStart, bEnd);
    });
    const overlapsBlock = partialBlocks.some((b) => {
      const bStart = athensDateTimeToUtc(date, b.startTime!);
      const bEnd = athensDateTimeToUtc(date, b.endTime!);
      return overlaps(cursor, slotEnd, bStart, bEnd);
    });

    if (!tooEarly && !overlapsAppt && !overlapsBreak && !overlapsBlock) {
      available.push({
        start: cursor.toISOString(),
        end: slotEnd.toISOString(),
        label: formatAthens(cursor, "HH:mm"),
      });
    }

    cursor = addMinutes(cursor, slotStep);
  }

  return { available, busy, durationMin };
}

/** Other staff who can do this service today and still have free slots. */
export async function findAlternativeStaff(params: {
  serviceId: string;
  date: string;
  excludeStaffId?: string;
}): Promise<StaffAlternative[]> {
  const links = await prisma.staffService.findMany({
    where: {
      serviceId: params.serviceId,
      staff: {
        status: "ACTIVE",
        ...(params.excludeStaffId ? { id: { not: params.excludeStaffId } } : {}),
      },
    },
    include: {
      staff: {
        select: { id: true, name: true, color: true, displayOrder: true },
      },
    },
    orderBy: { staff: { displayOrder: "asc" } },
  });

  const alternatives: StaffAlternative[] = [];
  for (const link of links) {
    const slots = await getAvailableSlots({
      serviceId: params.serviceId,
      staffId: link.staff.id,
      date: params.date,
    });
    if (!slots.length) continue;
    alternatives.push({
      staffId: link.staff.id,
      staffName: link.staff.name,
      color: link.staff.color,
      slotsCount: slots.length,
      nextLabel: slots[0]?.label ?? null,
    });
  }
  return alternatives;
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
  const date = formatAthens(params.startAt, "yyyy-MM-dd");
  const slots = await getAvailableSlots({
    serviceId: params.serviceId,
    staffId: params.staffId,
    date,
    excludeAppointmentId: params.excludeAppointmentId,
  });

  const match = slots.find(
    (s) => new Date(s.start).getTime() === params.startAt.getTime()
  );
  if (!match) {
    return { ok: false, error: "Η επιλεγμένη ώρα δεν είναι διαθέσιμη." };
  }

  const race = await prisma.appointment.findFirst({
    where: {
      staffId: params.staffId,
      status: { in: [...ACTIVE_STATUSES] },
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
  return `${formatAthens(start, "HH:mm")} – ${formatAthens(end, "HH:mm")}`;
}

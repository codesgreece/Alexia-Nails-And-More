import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

/** Salon timezone — all booking hours are interpreted in Greece. */
export const BUSINESS_TZ = "Europe/Athens";

/** Convert a local Athens calendar date + HH:mm into a UTC Date. */
export function athensDateTimeToUtc(date: string, time: string): Date {
  const normalized = time.length === 5 ? `${time}:00` : time;
  return fromZonedTime(`${date}T${normalized}`, BUSINESS_TZ);
}

/** Format a UTC instant as Athens wall-clock time/date. */
export function formatAthens(date: Date, pattern: string): string {
  return formatInTimeZone(date, BUSINESS_TZ, pattern);
}

/** Inclusive Athens day window as UTC instants. */
export function athensDayBounds(date: string): { start: Date; end: Date } {
  return {
    start: athensDateTimeToUtc(date, "00:00:00"),
    end: athensDateTimeToUtc(date, "23:59:59.999"),
  };
}

/**
 * Parse appointment start input.
 * - Absolute ISO (Z / offset) → used as-is
 * - Naive `YYYY-MM-DDTHH:mm[:ss]` → treated as Europe/Athens
 */
export function parseBookingStart(input: string): Date {
  const trimmed = input.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed) && !/(Z|[+-]\d{2}:?\d{2})$/i.test(trimmed)) {
    const [date, rest] = trimmed.split("T");
    const time = rest.slice(0, 8);
    return athensDateTimeToUtc(date, time);
  }
  return new Date(trimmed);
}

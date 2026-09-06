import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhoneLink(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("30")) return `tel:+${digits}`;
  if (digits.startsWith("0")) return `tel:+30${digits.slice(1)}`;
  return `tel:+30${digits}`;
}

export function generateConfirmationCode() {
  const part = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ANM-${part()}${part()}`;
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDateGR(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("el-GR", {
    timeZone: "Europe/Athens",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTimeGR(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("el-GR", {
    timeZone: "Europe/Athens",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const DAY_NAMES_GR = [
  "Κυριακή",
  "Δευτέρα",
  "Τρίτη",
  "Τετάρτη",
  "Πέμπτη",
  "Παρασκευή",
  "Σάββατο",
];

export function slugify(text: string) {
  const base = text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || `item-${Date.now().toString(36)}`;
}

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Εκκρεμές",
  CONFIRMED: "Επιβεβαιωμένο",
  COMPLETED: "Ολοκληρωμένο",
  CANCELLED: "Ακυρωμένο",
  NO_SHOW: "Δεν εμφανίστηκε",
};

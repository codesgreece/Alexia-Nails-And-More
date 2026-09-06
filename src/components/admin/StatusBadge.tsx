import { cn, APPOINTMENT_STATUS_LABELS } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  CONFIRMED: "bg-mint-soft text-charcoal border-mint/40",
  COMPLETED: "bg-blue/10 text-blue border-blue/20",
  CANCELLED: "bg-neutral-100 text-warm-gray border-neutral-200",
  NO_SHOW: "bg-pink-soft text-pink border-pink/20",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[status] || STATUS_STYLES.PENDING
      )}
    >
      {APPOINTMENT_STATUS_LABELS[status] || status}
    </span>
  );
}

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Αποτυχία ανεβάσματος");
  return data.url as string;
}

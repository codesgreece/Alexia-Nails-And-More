"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { el } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { APPOINTMENT_STATUS_LABELS, formatTimeGR } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";

type Appointment = {
  id: string;
  confirmationCode: string;
  status: string;
  startAt: string;
  endAt: string;
  notes?: string | null;
  adminNotes?: string | null;
  customer: { firstName: string; lastName: string; phone: string };
  staff: { id: string; name: string; color: string };
  service: { id: string; name: string };
};

type View = "day" | "week" | "month";

export default function CalendarPage() {
  const [view, setView] = useState<View>("week");
  const [cursor, setCursor] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [reschedule, setReschedule] = useState({ date: "", time: "" });
  const [loading, setLoading] = useState(true);

  const range = useMemo(() => {
    if (view === "day") {
      return {
        from: format(cursor, "yyyy-MM-dd") + "T00:00:00.000Z",
        to: format(cursor, "yyyy-MM-dd") + "T23:59:59.999Z",
      };
    }
    if (view === "week") {
      const start = startOfWeek(cursor, { weekStartsOn: 1 });
      const end = endOfWeek(cursor, { weekStartsOn: 1 });
      return { from: start.toISOString(), to: end.toISOString() };
    }
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return { from: start.toISOString(), to: end.toISOString() };
  }, [cursor, view]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/admin/appointments?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`
    );
    const data = await res.json();
    setAppointments(data.appointments || []);
    setLoading(false);
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const days = useMemo(() => {
    if (view === "day") return [cursor];
    if (view === "week") {
      const start = startOfWeek(cursor, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    const list: Date[] = [];
    let d = start;
    while (d <= end) {
      list.push(d);
      d = addDays(d, 1);
    }
    return list;
  }, [cursor, view]);

  async function patchAppointment(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Σφάλμα");
      return;
    }
    setSelected(data.appointment);
    load();
  }

  function openManage(a: Appointment) {
    setSelected(a);
    setReschedule({
      date: format(new Date(a.startAt), "yyyy-MM-dd"),
      time: format(new Date(a.startAt), "HH:mm"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Ημερολόγιο</p>
          <h1 className="font-display text-3xl md:text-4xl">
            {format(cursor, "MMMM yyyy", { locale: el })}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["day", "week", "month"] as View[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded-full border px-3 py-1.5 text-sm ${view === v ? "border-pink bg-pink-soft text-pink" : "border-[var(--border)]"}`}
            >
              {v === "day" ? "Ημέρα" : v === "week" ? "Εβδομάδα" : "Μήνας"}
            </button>
          ))}
          <button
            type="button"
            className="rounded-full border border-[var(--border)] p-2"
            onClick={() =>
              setCursor((c) =>
                view === "month" ? subMonths(c, 1) : addDays(c, view === "day" ? -1 : -7)
              )
            }
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm"
            onClick={() => setCursor(new Date())}
          >
            Σήμερα
          </button>
          <button
            type="button"
            className="rounded-full border border-[var(--border)] p-2"
            onClick={() =>
              setCursor((c) =>
                view === "month" ? addMonths(c, 1) : addDays(c, view === "day" ? 1 : 7)
              )
            }
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className={`admin-card grid gap-px bg-[var(--border)] overflow-hidden ${view === "month" ? "grid-cols-7" : view === "week" ? "grid-cols-1 md:grid-cols-7" : "grid-cols-1"}`}>
        {days.map((day) => {
          const dayItems = appointments
            .filter((a) => isSameDay(new Date(a.startAt), day))
            .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[140px] bg-white p-3 ${view === "month" && !isSameMonth(day, cursor) ? "opacity-40" : ""}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-warm-gray">
                  {format(day, "EEE", { locale: el })}
                </span>
                <span
                  className={`text-sm font-medium ${isSameDay(day, new Date()) ? "rounded-full bg-pink px-2 text-white" : ""}`}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="space-y-1.5">
                {dayItems.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => openManage(a)}
                    className="w-full rounded-lg border px-2 py-1.5 text-left text-xs transition hover:shadow-sm"
                    style={{
                      borderColor: a.staff.color,
                      background: `${a.staff.color}14`,
                    }}
                  >
                    <div className="font-semibold">
                      {formatTimeGR(a.startAt)} · {a.customer.firstName}
                    </div>
                    <div className="truncate text-warm-gray">{a.service.name}</div>
                  </button>
                ))}
                {!loading && dayItems.length === 0 && view !== "month" && (
                  <p className="text-xs text-warm-gray">Κενό</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4">
          <div className="admin-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl">
                  {selected.customer.firstName} {selected.customer.lastName}
                </h2>
                <p className="text-sm text-warm-gray">{selected.confirmationCode}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>
            <div className="mb-4 space-y-1 text-sm">
              <p>
                <strong>Υπηρεσία:</strong> {selected.service.name}
              </p>
              <p>
                <strong>Επαγγελματίας:</strong>{" "}
                <span style={{ color: selected.staff.color }}>{selected.staff.name}</span>
              </p>
              <p>
                <strong>Ώρα:</strong> {formatTimeGR(selected.startAt)} – {formatTimeGR(selected.endAt)}
              </p>
              <p>
                <strong>Τηλέφωνο:</strong> {selected.customer.phone}
              </p>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2">
              {(["CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm hover:border-pink"
                  onClick={() => patchAppointment(selected.id, { status: s })}
                >
                  {APPOINTMENT_STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            <div className="mb-4 rounded-xl border border-[var(--border)] p-3">
              <p className="mb-2 text-sm font-medium">Αναπρογραμματισμός</p>
              <div className="flex flex-wrap gap-2">
                <input
                  type="date"
                  className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                  value={reschedule.date}
                  onChange={(e) => setReschedule({ ...reschedule, date: e.target.value })}
                />
                <input
                  type="time"
                  className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                  value={reschedule.time}
                  onChange={(e) => setReschedule({ ...reschedule, time: e.target.value })}
                />
                <button
                  type="button"
                  className="btn-primary !px-3 !py-1.5 text-sm"
                  onClick={() =>
                    patchAppointment(selected.id, {
                      startAt: new Date(`${reschedule.date}T${reschedule.time}:00`).toISOString(),
                    })
                  }
                >
                  Αποθήκευση
                </button>
              </div>
            </div>

            <button
              type="button"
              className="btn-secondary w-full"
              onClick={() => setSelected(null)}
            >
              Κλείσιμο
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

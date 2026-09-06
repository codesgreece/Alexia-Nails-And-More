"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus, RefreshCw } from "lucide-react";
import { APPOINTMENT_STATUS_LABELS, formatDateGR, formatTimeGR } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";

type Appointment = {
  id: string;
  confirmationCode: string;
  status: string;
  startAt: string;
  endAt: string;
  notes?: string | null;
  adminNotes?: string | null;
  customer: { id: string; firstName: string; lastName: string; phone: string; email?: string | null };
  staff: { id: string; name: string; color: string };
  service: { id: string; name: string; durationMin: number };
};

type Staff = { id: string; name: string };
type Service = { id: string; name: string; durationMin: number };

const STATUSES = Object.keys(APPOINTMENT_STATUS_LABELS);

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    serviceId: "",
    staffId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "10:00",
    notes: "",
    status: "CONFIRMED",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const qs = status ? `?status=${status}` : "";
    const [aRes, sRes, svcRes] = await Promise.all([
      fetch(`/api/admin/appointments${qs}`),
      fetch("/api/admin/staff"),
      fetch("/api/admin/services"),
    ]);
    const aData = await aRes.json();
    const sData = await sRes.json();
    const svcData = await svcRes.json();
    setAppointments(aData.appointments || []);
    setStaff((sData.staff || []).filter((s: { status: string }) => s.status === "ACTIVE"));
    setServices((svcData.services || []).filter((s: { status: string }) => s.status === "ACTIVE"));
    setLoading(false);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, next: string) {
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Σφάλμα");
      return;
    }
    load();
  }

  async function createAppointment(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const startAt = `${form.date}T${form.time}:00`;
    const res = await fetch("/api/admin/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        serviceId: form.serviceId,
        staffId: form.staffId,
        startAt,
        notes: form.notes,
        status: form.status,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Αποτυχία δημιουργίας");
      return;
    }
    setShowForm(false);
    setForm({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      serviceId: "",
      staffId: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "10:00",
      notes: "",
      status: "CONFIRMED",
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Ραντεβού</p>
          <h1 className="font-display text-3xl md:text-4xl">Διαχείριση ραντεβού</h1>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="btn-secondary !px-4 !py-2.5 text-sm">
            <RefreshCw size={16} /> Ανανέωση
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn-primary !px-4 !py-2.5 text-sm"
          >
            <Plus size={16} /> Νέο
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStatus("")}
          className={`rounded-full border px-3 py-1.5 text-sm ${!status ? "border-pink bg-pink-soft text-pink" : "border-[var(--border)]"}`}
        >
          Όλα
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full border px-3 py-1.5 text-sm ${status === s ? "border-pink bg-pink-soft text-pink" : "border-[var(--border)]"}`}
          >
            {APPOINTMENT_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="admin-card p-6">
          <h2 className="mb-4 font-display text-xl">Νέο ραντεβού</h2>
          {error && <p className="mb-3 text-sm text-pink">{error}</p>}
          <form onSubmit={createAppointment} className="grid gap-3 md:grid-cols-2">
            <input
              required
              placeholder="Όνομα"
              className="rounded-xl border border-[var(--border)] px-3 py-2"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <input
              required
              placeholder="Επώνυμο"
              className="rounded-xl border border-[var(--border)] px-3 py-2"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
            <input
              required
              placeholder="Τηλέφωνο"
              className="rounded-xl border border-[var(--border)] px-3 py-2"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              placeholder="Email"
              type="email"
              className="rounded-xl border border-[var(--border)] px-3 py-2"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <select
              required
              className="rounded-xl border border-[var(--border)] px-3 py-2"
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
            >
              <option value="">Υπηρεσία</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMin}&apos;)
                </option>
              ))}
            </select>
            <select
              required
              className="rounded-xl border border-[var(--border)] px-3 py-2"
              value={form.staffId}
              onChange={(e) => setForm({ ...form, staffId: e.target.value })}
            >
              <option value="">Επαγγελματίας</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              required
              className="rounded-xl border border-[var(--border)] px-3 py-2"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <input
              type="time"
              required
              className="rounded-xl border border-[var(--border)] px-3 py-2"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
            <select
              className="rounded-xl border border-[var(--border)] px-3 py-2"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {APPOINTMENT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <input
              placeholder="Σημειώσεις"
              className="rounded-xl border border-[var(--border)] px-3 py-2 md:col-span-2"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" className="btn-primary !py-2.5 text-sm">
                Αποθήκευση
              </button>
              <button
                type="button"
                className="btn-secondary !py-2.5 text-sm"
                onClick={() => setShowForm(false)}
              >
                Ακύρωση
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card overflow-x-auto">
        {loading ? (
          <p className="p-8 text-center text-warm-gray">Φόρτωση…</p>
        ) : appointments.length === 0 ? (
          <p className="p-8 text-center text-warm-gray">Δεν υπάρχουν ραντεβού.</p>
        ) : (
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-bg-soft text-warm-gray">
              <tr>
                <th className="px-4 py-3 font-medium">Ημερομηνία</th>
                <th className="px-4 py-3 font-medium">Πελάτισσα</th>
                <th className="px-4 py-3 font-medium">Υπηρεσία</th>
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Κωδικός</th>
                <th className="px-4 py-3 font-medium">Κατάσταση</th>
                <th className="px-4 py-3 font-medium">Ενέργειες</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{formatTimeGR(a.startAt)}</div>
                    <div className="text-xs text-warm-gray">{formatDateGR(a.startAt)}</div>
                  </td>
                  <td className="px-4 py-3">
                    {a.customer.firstName} {a.customer.lastName}
                    <div className="text-xs text-warm-gray">{a.customer.phone}</div>
                  </td>
                  <td className="px-4 py-3">{a.service.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: a.staff.color }}
                      />
                      {a.staff.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{a.confirmationCode}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs"
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {APPOINTMENT_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { DAY_NAMES_GR } from "@/lib/utils";
import { uploadFile } from "@/components/admin/StatusBadge";

type Service = { id: string; name: string };
type Schedule = {
  dayOfWeek: number;
  isOff: boolean;
  startTime?: string | null;
  endTime?: string | null;
};
type BreakItem = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  label?: string | null;
};
type Vacation = { startDate: string; endDate: string; reason?: string | null };
type Blocked = {
  date: string;
  endDate?: string | null;
  reason?: string | null;
  allDay?: boolean;
  startTime?: string | null;
  endTime?: string | null;
};

type Staff = {
  id: string;
  name: string;
  slug: string;
  photoUrl?: string | null;
  bio?: string | null;
  specialties?: string | null;
  color: string;
  status: string;
  displayOrder: number;
  services: Array<{ serviceId: string; service: Service }>;
  schedules: Schedule[];
  breaks: BreakItem[];
  vacations: Array<Vacation & { startDate: string; endDate: string }>;
  blockedDates: Array<Blocked & { date: string }>;
};

function defaultSchedules(): Schedule[] {
  return Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    isOff: dayOfWeek === 0,
    startTime: dayOfWeek === 0 ? null : "09:00",
    endTime: dayOfWeek === 0 ? null : dayOfWeek === 6 || dayOfWeek === 1 || dayOfWeek === 3 ? "17:00" : "20:00",
  }));
}

const emptyForm = {
  id: "",
  name: "",
  photoUrl: "",
  bio: "",
  specialties: "",
  color: "#D91B73",
  status: "ACTIVE",
  displayOrder: 0,
  serviceIds: [] as string[],
  schedules: defaultSchedules(),
  breaks: [] as BreakItem[],
  vacations: [] as Vacation[],
  blockedDates: [] as Blocked[],
};

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"basic" | "schedule" | "breaks" | "vacation" | "blocked">("basic");

  const load = useCallback(async () => {
    setLoading(true);
    const [sRes, svcRes] = await Promise.all([
      fetch("/api/admin/staff"),
      fetch("/api/admin/services"),
    ]);
    const sData = await sRes.json();
    const svcData = await svcRes.json();
    setStaff(sData.staff || []);
    setServices((svcData.services || []).map((s: Service & { status: string }) => s));
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setForm(emptyForm);
    setTab("basic");
    setEditing(true);
  }

  function openEdit(s: Staff) {
    const schedules =
      s.schedules.length > 0
        ? defaultSchedules().map((d) => {
            const found = s.schedules.find((x) => x.dayOfWeek === d.dayOfWeek);
            return found || d;
          })
        : defaultSchedules();
    setForm({
      id: s.id,
      name: s.name,
      photoUrl: s.photoUrl || "",
      bio: s.bio || "",
      specialties: s.specialties || "",
      color: s.color,
      status: s.status,
      displayOrder: s.displayOrder,
      serviceIds: s.services.map((x) => x.serviceId),
      schedules,
      breaks: s.breaks.map((b) => ({
        dayOfWeek: b.dayOfWeek,
        startTime: b.startTime,
        endTime: b.endTime,
        label: b.label,
      })),
      vacations: s.vacations.map((v) => ({
        startDate: v.startDate.slice(0, 10),
        endDate: v.endDate.slice(0, 10),
        reason: v.reason,
      })),
      blockedDates: s.blockedDates.map((b) => ({
        date: b.date.slice(0, 10),
        endDate: b.endDate ? b.endDate.slice(0, 10) : null,
        reason: b.reason,
        allDay: b.allDay,
        startTime: b.startTime,
        endTime: b.endTime,
      })),
    });
    setTab("basic");
    setEditing(true);
  }

  async function onPhoto(file: File | null) {
    if (!file) return;
    const url = await uploadFile(file);
    setForm((f) => ({ ...f, photoUrl: url }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      photoUrl: form.photoUrl || null,
      bio: form.bio || null,
      specialties: form.specialties || null,
      color: form.color,
      status: form.status,
      displayOrder: form.displayOrder,
      serviceIds: form.serviceIds,
      schedules: form.schedules,
      breaks: form.breaks,
      vacations: form.vacations,
      blockedDates: form.blockedDates,
    };
    const res = await fetch(form.id ? `/api/admin/staff/${form.id}` : "/api/admin/staff", {
      method: form.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Σφάλμα");
      return;
    }
    setEditing(false);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Ομάδα</p>
          <h1 className="font-display text-3xl md:text-4xl">Προσωπικό</h1>
        </div>
        <button type="button" className="btn-primary !px-4 !py-2.5 text-sm" onClick={openCreate}>
          <Plus size={16} /> Νέο μέλος
        </button>
      </div>

      {editing && (
        <form onSubmit={save} className="admin-card space-y-4 p-6">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["basic", "Βασικά"],
                ["schedule", "Ωράριο"],
                ["breaks", "Διαλείμματα"],
                ["vacation", "Άδειες"],
                ["blocked", "Μπλοκαρίσματα"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                className={`rounded-full border px-3 py-1.5 text-sm ${tab === k ? "border-pink bg-pink-soft text-pink" : "border-[var(--border)]"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "basic" && (
            <div className="grid gap-3 md:grid-cols-2">
              <input
                required
                placeholder="Όνομα"
                className="rounded-xl border border-[var(--border)] px-3 py-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="color"
                className="h-11 w-full rounded-xl border border-[var(--border)] px-2"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
              />
              <textarea
                placeholder="Bio"
                className="rounded-xl border border-[var(--border)] px-3 py-2 md:col-span-2"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
              <input
                placeholder="Ειδικότητες"
                className="rounded-xl border border-[var(--border)] px-3 py-2 md:col-span-2"
                value={form.specialties}
                onChange={(e) => setForm({ ...form, specialties: e.target.value })}
              />
              <select
                className="rounded-xl border border-[var(--border)] px-3 py-2"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="ACTIVE">Ενεργό</option>
                <option value="INACTIVE">Ανενεργό</option>
              </select>
              <input
                type="number"
                placeholder="Σειρά"
                className="rounded-xl border border-[var(--border)] px-3 py-2"
                value={form.displayOrder}
                onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
              />
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Φωτογραφία</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPhoto(e.target.files?.[0] || null)}
                />
                {form.photoUrl && (
                  <Image
                    src={form.photoUrl}
                    alt=""
                    width={80}
                    height={80}
                    className="mt-2 rounded-full object-cover"
                  />
                )}
              </div>
              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-medium">Υπηρεσίες</p>
                <div className="flex flex-wrap gap-2">
                  {services.map((s) => {
                    const checked = form.serviceIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${checked ? "border-pink bg-pink-soft text-pink" : "border-[var(--border)]"}`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() =>
                            setForm({
                              ...form,
                              serviceIds: checked
                                ? form.serviceIds.filter((id) => id !== s.id)
                                : [...form.serviceIds, s.id],
                            })
                          }
                        />
                        {s.name}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === "schedule" && (
            <div className="space-y-2">
              {form.schedules.map((s, idx) => (
                <div key={s.dayOfWeek} className="grid grid-cols-[120px_1fr_1fr_auto] items-center gap-2">
                  <span className="text-sm font-medium">{DAY_NAMES_GR[s.dayOfWeek]}</span>
                  <input
                    type="time"
                    disabled={s.isOff}
                    className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm disabled:opacity-40"
                    value={s.startTime || ""}
                    onChange={(e) => {
                      const schedules = [...form.schedules];
                      schedules[idx] = { ...s, startTime: e.target.value };
                      setForm({ ...form, schedules });
                    }}
                  />
                  <input
                    type="time"
                    disabled={s.isOff}
                    className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm disabled:opacity-40"
                    value={s.endTime || ""}
                    onChange={(e) => {
                      const schedules = [...form.schedules];
                      schedules[idx] = { ...s, endTime: e.target.value };
                      setForm({ ...form, schedules });
                    }}
                  />
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={s.isOff}
                      onChange={(e) => {
                        const schedules = [...form.schedules];
                        schedules[idx] = { ...s, isOff: e.target.checked };
                        setForm({ ...form, schedules });
                      }}
                    />
                    Off
                  </label>
                </div>
              ))}
            </div>
          )}

          {tab === "breaks" && (
            <div className="space-y-3">
              {form.breaks.map((b, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2">
                  <select
                    className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                    value={b.dayOfWeek}
                    onChange={(e) => {
                      const breaks = [...form.breaks];
                      breaks[idx] = { ...b, dayOfWeek: Number(e.target.value) };
                      setForm({ ...form, breaks });
                    }}
                  >
                    {DAY_NAMES_GR.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={b.startTime}
                    onChange={(e) => {
                      const breaks = [...form.breaks];
                      breaks[idx] = { ...b, startTime: e.target.value };
                      setForm({ ...form, breaks });
                    }}
                    className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                  />
                  <input
                    type="time"
                    value={b.endTime}
                    onChange={(e) => {
                      const breaks = [...form.breaks];
                      breaks[idx] = { ...b, endTime: e.target.value };
                      setForm({ ...form, breaks });
                    }}
                    className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                  />
                  <input
                    placeholder="Ετικέτα"
                    value={b.label || ""}
                    onChange={(e) => {
                      const breaks = [...form.breaks];
                      breaks[idx] = { ...b, label: e.target.value };
                      setForm({ ...form, breaks });
                    }}
                    className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    className="text-sm text-pink"
                    onClick={() =>
                      setForm({ ...form, breaks: form.breaks.filter((_, i) => i !== idx) })
                    }
                  >
                    Διαγραφή
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-secondary !py-2 text-sm"
                onClick={() =>
                  setForm({
                    ...form,
                    breaks: [
                      ...form.breaks,
                      { dayOfWeek: 1, startTime: "13:00", endTime: "14:00", label: "Διάλειμμα" },
                    ],
                  })
                }
              >
                + Διάλειμμα
              </button>
            </div>
          )}

          {tab === "vacation" && (
            <div className="space-y-3">
              {form.vacations.map((v, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2">
                  <input
                    type="date"
                    value={v.startDate}
                    onChange={(e) => {
                      const vacations = [...form.vacations];
                      vacations[idx] = { ...v, startDate: e.target.value };
                      setForm({ ...form, vacations });
                    }}
                    className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                  />
                  <input
                    type="date"
                    value={v.endDate}
                    onChange={(e) => {
                      const vacations = [...form.vacations];
                      vacations[idx] = { ...v, endDate: e.target.value };
                      setForm({ ...form, vacations });
                    }}
                    className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                  />
                  <input
                    placeholder="Λόγος"
                    value={v.reason || ""}
                    onChange={(e) => {
                      const vacations = [...form.vacations];
                      vacations[idx] = { ...v, reason: e.target.value };
                      setForm({ ...form, vacations });
                    }}
                    className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    className="text-sm text-pink"
                    onClick={() =>
                      setForm({
                        ...form,
                        vacations: form.vacations.filter((_, i) => i !== idx),
                      })
                    }
                  >
                    Διαγραφή
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-secondary !py-2 text-sm"
                onClick={() =>
                  setForm({
                    ...form,
                    vacations: [
                      ...form.vacations,
                      {
                        startDate: new Date().toISOString().slice(0, 10),
                        endDate: new Date().toISOString().slice(0, 10),
                        reason: "",
                      },
                    ],
                  })
                }
              >
                + Άδεια
              </button>
            </div>
          )}

          {tab === "blocked" && (
            <div className="space-y-3">
              {form.blockedDates.map((b, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-2">
                  <input
                    type="date"
                    value={b.date}
                    onChange={(e) => {
                      const blockedDates = [...form.blockedDates];
                      blockedDates[idx] = { ...b, date: e.target.value };
                      setForm({ ...form, blockedDates });
                    }}
                    className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                  />
                  <input
                    placeholder="Λόγος"
                    value={b.reason || ""}
                    onChange={(e) => {
                      const blockedDates = [...form.blockedDates];
                      blockedDates[idx] = { ...b, reason: e.target.value };
                      setForm({ ...form, blockedDates });
                    }}
                    className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    className="text-sm text-pink"
                    onClick={() =>
                      setForm({
                        ...form,
                        blockedDates: form.blockedDates.filter((_, i) => i !== idx),
                      })
                    }
                  >
                    Διαγραφή
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-secondary !py-2 text-sm"
                onClick={() =>
                  setForm({
                    ...form,
                    blockedDates: [
                      ...form.blockedDates,
                      {
                        date: new Date().toISOString().slice(0, 10),
                        reason: "",
                        allDay: true,
                      },
                    ],
                  })
                }
              >
                + Μπλοκάρισμα
              </button>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary !py-2.5 text-sm">
              Αποθήκευση
            </button>
            <button
              type="button"
              className="btn-secondary !py-2.5 text-sm"
              onClick={() => setEditing(false)}
            >
              Ακύρωση
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <p className="text-warm-gray">Φόρτωση…</p>
        ) : (
          staff.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => openEdit(s)}
              className="admin-card p-5 text-left transition hover:-translate-y-0.5"
            >
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full text-white"
                  style={{ background: s.color }}
                >
                  {s.photoUrl ? (
                    <Image src={s.photoUrl} alt={s.name} width={48} height={48} className="object-cover" />
                  ) : (
                    s.name.slice(0, 1)
                  )}
                </div>
                <div>
                  <p className="font-display text-xl">{s.name}</p>
                  <p className="text-xs text-warm-gray">
                    {s.status === "ACTIVE" ? "Ενεργό" : "Ανενεργό"} · {s.services.length} υπηρεσίες
                  </p>
                </div>
              </div>
              <p className="line-clamp-2 text-sm text-warm-gray">{s.bio || s.specialties || "—"}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

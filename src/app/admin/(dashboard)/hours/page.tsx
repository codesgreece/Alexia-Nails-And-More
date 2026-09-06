"use client";

import { useCallback, useEffect, useState } from "react";
import { DAY_NAMES_GR } from "@/lib/utils";

type Hour = {
  id?: string;
  dayOfWeek: number;
  isClosed: boolean;
  openTime?: string | null;
  closeTime?: string | null;
};

type Special = {
  id: string;
  date: string;
  isClosed: boolean;
  openTime?: string | null;
  closeTime?: string | null;
  reason?: string | null;
};

type Blocked = {
  id: string;
  date: string;
  endDate?: string | null;
  reason?: string | null;
  allDay: boolean;
};

export default function HoursPage() {
  const [hours, setHours] = useState<Hour[]>([]);
  const [special, setSpecial] = useState<Special[]>([]);
  const [blocked, setBlocked] = useState<Blocked[]>([]);
  const [message, setMessage] = useState("");
  const [specialForm, setSpecialForm] = useState({
    date: "",
    isClosed: true,
    openTime: "09:00",
    closeTime: "17:00",
    reason: "",
  });
  const [blockedForm, setBlockedForm] = useState({
    date: "",
    endDate: "",
    reason: "",
  });

  const load = useCallback(async () => {
    const [h, s, b] = await Promise.all([
      fetch("/api/admin/hours"),
      fetch("/api/admin/special-hours"),
      fetch("/api/admin/blocked"),
    ]);
    const hData = await h.json();
    const sData = await s.json();
    const bData = await b.json();
    const base = Array.from({ length: 7 }, (_, dayOfWeek) => ({
      dayOfWeek,
      isClosed: dayOfWeek === 0,
      openTime: "09:00",
      closeTime: "17:00",
    }));
    const merged = base.map((d) => {
      const found = (hData.hours || []).find((x: Hour) => x.dayOfWeek === d.dayOfWeek);
      return found || d;
    });
    setHours(merged);
    setSpecial(sData.specialHours || []);
    setBlocked(bData.blocked || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveHours(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/admin/hours", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hours }),
    });
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "Σφάλμα");
      return;
    }
    setMessage("Το ωράριο αποθηκεύτηκε.");
    load();
  }

  async function addSpecial(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/special-hours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(specialForm),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Σφάλμα");
      return;
    }
    setSpecialForm({
      date: "",
      isClosed: true,
      openTime: "09:00",
      closeTime: "17:00",
      reason: "",
    });
    load();
  }

  async function addBlocked(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/blocked", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: blockedForm.date,
        endDate: blockedForm.endDate || null,
        reason: blockedForm.reason,
        allDay: true,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Σφάλμα");
      return;
    }
    setBlockedForm({ date: "", endDate: "", reason: "" });
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Διαθεσιμότητα</p>
        <h1 className="font-display text-3xl md:text-4xl">Ωράριο & κλεισίματα</h1>
      </div>

      <form onSubmit={saveHours} className="admin-card space-y-3 p-6">
        <h2 className="font-display text-xl">Εβδομαδιαίο ωράριο</h2>
        {hours.map((h, idx) => (
          <div
            key={h.dayOfWeek}
            className="grid grid-cols-[140px_1fr_1fr_auto] items-center gap-2"
          >
            <span className="text-sm font-medium">{DAY_NAMES_GR[h.dayOfWeek]}</span>
            <input
              type="time"
              disabled={h.isClosed}
              className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm disabled:opacity-40"
              value={h.openTime || ""}
              onChange={(e) => {
                const next = [...hours];
                next[idx] = { ...h, openTime: e.target.value };
                setHours(next);
              }}
            />
            <input
              type="time"
              disabled={h.isClosed}
              className="rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm disabled:opacity-40"
              value={h.closeTime || ""}
              onChange={(e) => {
                const next = [...hours];
                next[idx] = { ...h, closeTime: e.target.value };
                setHours(next);
              }}
            />
            <label className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={h.isClosed}
                onChange={(e) => {
                  const next = [...hours];
                  next[idx] = { ...h, isClosed: e.target.checked };
                  setHours(next);
                }}
              />
              Κλειστά
            </label>
          </div>
        ))}
        {message && <p className="text-sm text-pink">{message}</p>}
        <button type="submit" className="btn-primary !py-2.5 text-sm">
          Αποθήκευση ωραρίου
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="admin-card space-y-4 p-6">
          <h2 className="font-display text-xl">Ειδικό ωράριο</h2>
          <form onSubmit={addSpecial} className="space-y-2">
            <input
              type="date"
              required
              className="w-full rounded-xl border border-[var(--border)] px-3 py-2"
              value={specialForm.date}
              onChange={(e) => setSpecialForm({ ...specialForm, date: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={specialForm.isClosed}
                onChange={(e) =>
                  setSpecialForm({ ...specialForm, isClosed: e.target.checked })
                }
              />
              Κλειστά όλη μέρα
            </label>
            {!specialForm.isClosed && (
              <div className="flex gap-2">
                <input
                  type="time"
                  className="flex-1 rounded-xl border border-[var(--border)] px-3 py-2"
                  value={specialForm.openTime}
                  onChange={(e) =>
                    setSpecialForm({ ...specialForm, openTime: e.target.value })
                  }
                />
                <input
                  type="time"
                  className="flex-1 rounded-xl border border-[var(--border)] px-3 py-2"
                  value={specialForm.closeTime}
                  onChange={(e) =>
                    setSpecialForm({ ...specialForm, closeTime: e.target.value })
                  }
                />
              </div>
            )}
            <input
              placeholder="Λόγος"
              className="w-full rounded-xl border border-[var(--border)] px-3 py-2"
              value={specialForm.reason}
              onChange={(e) => setSpecialForm({ ...specialForm, reason: e.target.value })}
            />
            <button type="submit" className="btn-secondary !py-2 text-sm">
              Προσθήκη
            </button>
          </form>
          <ul className="divide-y divide-[var(--border)] text-sm">
            {special.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2">
                <span>
                  {s.date.slice(0, 10)} ·{" "}
                  {s.isClosed ? "Κλειστά" : `${s.openTime}–${s.closeTime}`}
                  {s.reason ? ` · ${s.reason}` : ""}
                </span>
                <button
                  type="button"
                  className="text-pink"
                  onClick={async () => {
                    await fetch(`/api/admin/special-hours?id=${s.id}`, { method: "DELETE" });
                    load();
                  }}
                >
                  Διαγραφή
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-card space-y-4 p-6">
          <h2 className="font-display text-xl">Μπλοκαρισμένες ημερομηνίες</h2>
          <form onSubmit={addBlocked} className="space-y-2">
            <input
              type="date"
              required
              className="w-full rounded-xl border border-[var(--border)] px-3 py-2"
              value={blockedForm.date}
              onChange={(e) => setBlockedForm({ ...blockedForm, date: e.target.value })}
            />
            <input
              type="date"
              className="w-full rounded-xl border border-[var(--border)] px-3 py-2"
              value={blockedForm.endDate}
              onChange={(e) => setBlockedForm({ ...blockedForm, endDate: e.target.value })}
              placeholder="Έως"
            />
            <input
              placeholder="Λόγος"
              className="w-full rounded-xl border border-[var(--border)] px-3 py-2"
              value={blockedForm.reason}
              onChange={(e) => setBlockedForm({ ...blockedForm, reason: e.target.value })}
            />
            <button type="submit" className="btn-secondary !py-2 text-sm">
              Προσθήκη
            </button>
          </form>
          <ul className="divide-y divide-[var(--border)] text-sm">
            {blocked.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-2">
                <span>
                  {b.date.slice(0, 10)}
                  {b.endDate ? ` → ${b.endDate.slice(0, 10)}` : ""}
                  {b.reason ? ` · ${b.reason}` : ""}
                </span>
                <button
                  type="button"
                  className="text-pink"
                  onClick={async () => {
                    await fetch(`/api/admin/blocked?id=${b.id}`, { method: "DELETE" });
                    load();
                  }}
                >
                  Διαγραφή
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

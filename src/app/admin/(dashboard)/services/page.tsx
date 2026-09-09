"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock3, Plus } from "lucide-react";

type Category = { id: string; name: string; displayOrder: number };
type Staff = { id: string; name: string };
type Service = {
  id: string;
  name: string;
  description?: string | null;
  durationMin: number;
  displayOrder: number;
  status: string;
  categoryId: string;
  category: Category;
  staff: Array<{ staffId: string; staff: Staff }>;
};

const empty = {
  id: "",
  name: "",
  description: "",
  durationMin: 0,
  displayOrder: 0,
  status: "ACTIVE",
  categoryId: "",
  staffIds: [] as string[],
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [form, setForm] = useState(empty);
  const [catName, setCatName] = useState("");
  const [editing, setEditing] = useState(false);
  const [durationsMode, setDurationsMode] = useState(false);
  const [durationDrafts, setDurationDrafts] = useState<Record<string, number>>({});
  const [savingDurations, setSavingDurations] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [svc, cat, st] = await Promise.all([
      fetch("/api/admin/services"),
      fetch("/api/admin/categories"),
      fetch("/api/admin/staff"),
    ]);
    const svcData = await svc.json();
    const catData = await cat.json();
    const stData = await st.json();
    const list: Service[] = svcData.services || [];
    setServices(list);
    setCategories(catData.categories || []);
    setStaff((stData.staff || []).filter((s: { status: string }) => s.status === "ACTIVE"));
    setDurationDrafts(
      Object.fromEntries(list.map((s) => [s.id, s.durationMin]))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!catName.trim()) return;
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: catName }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Σφάλμα");
      return;
    }
    setCatName("");
    load();
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description || null,
      durationMin: form.durationMin,
      displayOrder: form.displayOrder,
      status: form.status,
      categoryId: form.categoryId,
      staffIds: form.staffIds,
    };
    const res = await fetch(form.id ? `/api/admin/services/${form.id}` : "/api/admin/services", {
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
    setForm(empty);
    load();
  }

  async function saveDurations(e: React.FormEvent) {
    e.preventDefault();
    setSavingDurations(true);
    const updates = services.map((s) => ({
      id: s.id,
      durationMin: Math.max(0, Number(durationDrafts[s.id] ?? s.durationMin) || 0),
    }));
    const res = await fetch("/api/admin/services/durations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    const data = await res.json();
    setSavingDurations(false);
    if (!res.ok) {
      alert(data.error || "Σφάλμα αποθήκευσης διαρκειών");
      return;
    }
    setDurationsMode(false);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Κατάλογος</p>
          <h1 className="font-display text-3xl md:text-4xl">Υπηρεσίες</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary !px-4 !py-2.5 text-sm"
            onClick={() => {
              setEditing(false);
              setDurationDrafts(
                Object.fromEntries(services.map((s) => [s.id, s.durationMin]))
              );
              setDurationsMode(true);
            }}
          >
            <Clock3 size={16} /> Ρύθμιση Διαρκειών
          </button>
          <button
            type="button"
            className="btn-primary !px-4 !py-2.5 text-sm"
            onClick={() => {
              setDurationsMode(false);
              setForm({ ...empty, categoryId: categories[0]?.id || "" });
              setEditing(true);
            }}
          >
            <Plus size={16} /> Νέα υπηρεσία
          </button>
        </div>
      </div>

      <form onSubmit={saveCategory} className="admin-card flex flex-wrap items-end gap-3 p-4">
        <label className="min-w-[220px] flex-1 text-sm">
          Νέα κατηγορία
          <input
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2"
            placeholder="π.χ. Μανικιούρ"
          />
        </label>
        <button type="submit" className="btn-secondary !py-2.5 text-sm">
          Προσθήκη
        </button>
      </form>

      {durationsMode && (
        <form onSubmit={saveDurations} className="admin-card space-y-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl">Χειροκίνητη ρύθμιση διαρκειών</h2>
              <p className="mt-1 text-sm text-warm-gray">
                Ορίστε λεπτά για κάθε υπηρεσία. Το 0 σημαίνει ότι δεν εμφανίζεται διάρκεια
                και δεν δίνονται online slots μέχρι να οριστεί.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="btn-primary !py-2.5 text-sm"
                disabled={savingDurations}
              >
                {savingDurations ? "Αποθήκευση…" : "Αποθήκευση διαρκειών"}
              </button>
              <button
                type="button"
                className="btn-secondary !py-2.5 text-sm"
                onClick={() => setDurationsMode(false)}
              >
                Ακύρωση
              </button>
            </div>
          </div>
          <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
            {services.map((s) => (
              <label
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{s.name}</span>
                  <span className="mt-0.5 block text-xs text-warm-gray">{s.category.name}</span>
                </span>
                <span className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step={5}
                    className="w-24 rounded-xl border border-[var(--border)] px-3 py-2 text-right"
                    value={durationDrafts[s.id] ?? 0}
                    onChange={(e) =>
                      setDurationDrafts((prev) => ({
                        ...prev,
                        [s.id]: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                  />
                  <span className="text-warm-gray">λεπτά</span>
                </span>
              </label>
            ))}
          </div>
        </form>
      )}

      {editing && (
        <form onSubmit={save} className="admin-card grid gap-3 p-6 md:grid-cols-2">
          <h2 className="font-display text-xl md:col-span-2">
            {form.id ? "Επεξεργασία υπηρεσίας" : "Νέα υπηρεσία"}
          </h2>
          <input
            required
            placeholder="Όνομα"
            className="rounded-xl border border-[var(--border)] px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <select
            required
            className="rounded-xl border border-[var(--border)] px-3 py-2"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">Κατηγορία</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            required
            min={0}
            placeholder="Διάρκεια (λεπτά)"
            className="rounded-xl border border-[var(--border)] px-3 py-2"
            value={form.durationMin}
            onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })}
          />
          <input
            type="number"
            placeholder="Σειρά εμφάνισης"
            className="rounded-xl border border-[var(--border)] px-3 py-2"
            value={form.displayOrder}
            onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
          />
          <select
            className="rounded-xl border border-[var(--border)] px-3 py-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="ACTIVE">Ενεργή</option>
            <option value="INACTIVE">Ανενεργή</option>
          </select>
          <textarea
            placeholder="Περιγραφή"
            className="rounded-xl border border-[var(--border)] px-3 py-2 md:col-span-2"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="md:col-span-2">
            <p className="mb-2 text-sm font-medium">Ανάθεση προσωπικού</p>
            <div className="flex flex-wrap gap-2">
              {staff.map((s) => {
                const checked = form.staffIds.includes(s.id);
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
                          staffIds: checked
                            ? form.staffIds.filter((id) => id !== s.id)
                            : [...form.staffIds, s.id],
                        })
                      }
                    />
                    {s.name}
                  </label>
                );
              })}
            </div>
          </div>
          <div className="flex gap-2 md:col-span-2">
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

      <div className="admin-card overflow-x-auto">
        {loading ? (
          <p className="p-8 text-center text-warm-gray">Φόρτωση…</p>
        ) : (
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-bg-soft text-warm-gray">
              <tr>
                <th className="px-4 py-3 font-medium">Υπηρεσία</th>
                <th className="px-4 py-3 font-medium">Κατηγορία</th>
                <th className="px-4 py-3 font-medium">Διάρκεια</th>
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Σειρά</th>
                <th className="px-4 py-3 font-medium">Κατάσταση</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{s.category.name}</td>
                  <td className="px-4 py-3">
                    {s.durationMin > 0 ? `${s.durationMin}'` : "0' (μη ορισμένη)"}
                  </td>
                  <td className="px-4 py-3">
                    {s.staff.map((x) => x.staff.name).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">{s.displayOrder}</td>
                  <td className="px-4 py-3">
                    {s.status === "ACTIVE" ? "Ενεργή" : "Ανενεργή"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-sm font-medium text-pink hover:underline"
                      onClick={() => {
                        setDurationsMode(false);
                        setForm({
                          id: s.id,
                          name: s.name,
                          description: s.description || "",
                          durationMin: s.durationMin,
                          displayOrder: s.displayOrder,
                          status: s.status,
                          categoryId: s.categoryId,
                          staffIds: s.staff.map((x) => x.staffId),
                        });
                        setEditing(true);
                      }}
                    >
                      Επεξεργασία
                    </button>
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

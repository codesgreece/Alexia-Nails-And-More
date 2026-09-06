"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";

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
  durationMin: 45,
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
    setServices(svcData.services || []);
    setCategories(catData.categories || []);
    setStaff((stData.staff || []).filter((s: { status: string }) => s.status === "ACTIVE"));
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Κατάλογος</p>
          <h1 className="font-display text-3xl md:text-4xl">Υπηρεσίες</h1>
        </div>
        <button
          type="button"
          className="btn-primary !px-4 !py-2.5 text-sm"
          onClick={() => {
            setForm({ ...empty, categoryId: categories[0]?.id || "" });
            setEditing(true);
          }}
        >
          <Plus size={16} /> Νέα υπηρεσία
        </button>
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
            min={5}
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
                  <td className="px-4 py-3">{s.durationMin}&apos;</td>
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

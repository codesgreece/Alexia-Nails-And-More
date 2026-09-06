"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { formatDateGR, formatPhoneLink } from "@/lib/utils";

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  createdAt: string;
  _count: { appointments: number };
  appointments: Array<{ startAt: string; service: { name: string } }>;
};

const empty = {
  id: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  notes: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    const data = await res.json();
    setCustomers(data.customers || []);
    setLoading(false);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const method = form.id ? "PATCH" : "POST";
    const res = await fetch("/api/admin/customers", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
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
          <p className="eyebrow">CRM</p>
          <h1 className="font-display text-3xl md:text-4xl">Πελάτισσες</h1>
        </div>
        <button
          type="button"
          className="btn-primary !px-4 !py-2.5 text-sm"
          onClick={() => {
            setForm(empty);
            setEditing(true);
          }}
        >
          <Plus size={16} /> Νέα πελάτισσα
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-warm-gray" size={16} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Αναζήτηση ονόματος, τηλεφώνου, email…"
          className="w-full rounded-xl border border-[var(--border)] bg-white py-2.5 pr-3 pl-10"
        />
      </div>

      {editing && (
        <form onSubmit={save} className="admin-card grid gap-3 p-6 md:grid-cols-2">
          <h2 className="font-display text-xl md:col-span-2">
            {form.id ? "Επεξεργασία" : "Νέα πελάτισσα"}
          </h2>
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
          <textarea
            placeholder="Σημειώσεις"
            className="rounded-xl border border-[var(--border)] px-3 py-2 md:col-span-2"
            rows={3}
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
        ) : customers.length === 0 ? (
          <p className="p-8 text-center text-warm-gray">Καμία πελάτισσα.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-bg-soft text-warm-gray">
              <tr>
                <th className="px-4 py-3 font-medium">Όνομα</th>
                <th className="px-4 py-3 font-medium">Επικοινωνία</th>
                <th className="px-4 py-3 font-medium">Ραντεβού</th>
                <th className="px-4 py-3 font-medium">Τελευταίο</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-3 font-medium">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <a href={formatPhoneLink(c.phone)} className="text-pink hover:underline">
                      {c.phone}
                    </a>
                    {c.email && <div className="text-xs text-warm-gray">{c.email}</div>}
                  </td>
                  <td className="px-4 py-3">{c._count.appointments}</td>
                  <td className="px-4 py-3 text-warm-gray">
                    {c.appointments[0]
                      ? `${formatDateGR(c.appointments[0].startAt)} · ${c.appointments[0].service.name}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-sm font-medium text-pink hover:underline"
                      onClick={() => {
                        setForm({
                          id: c.id,
                          firstName: c.firstName,
                          lastName: c.lastName,
                          phone: c.phone,
                          email: c.email || "",
                          notes: c.notes || "",
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

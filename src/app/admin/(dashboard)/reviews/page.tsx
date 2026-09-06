"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Star } from "lucide-react";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  content: string;
  source: string;
  sourceUrl?: string | null;
  published: boolean;
  featured: boolean;
  displayOrder: number;
};

const empty = {
  id: "",
  authorName: "",
  rating: 5,
  content: "",
  source: "ADMIN",
  sourceUrl: "",
  published: false,
  featured: false,
  displayOrder: 0,
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(data.reviews || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      authorName: form.authorName,
      rating: form.rating,
      content: form.content,
      source: form.source || "ADMIN",
      sourceUrl: form.sourceUrl || null,
      published: form.published,
      featured: form.featured,
      displayOrder: form.displayOrder,
    };
    const res = await fetch(form.id ? `/api/admin/reviews/${form.id}` : "/api/admin/reviews", {
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

  async function togglePublish(r: Review) {
    await fetch(`/api/admin/reviews/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !r.published }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Διαγραφή κριτικής;")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Testimonials</p>
          <h1 className="font-display text-3xl md:text-4xl">Κριτικές</h1>
          <p className="mt-1 text-sm text-warm-gray">
            Μόνο χειροκίνητα διαχειριζόμενες κριτικές — χωρίς αυτόματη δημιουργία.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary !px-4 !py-2.5 text-sm"
          onClick={() => {
            setForm(empty);
            setEditing(true);
          }}
        >
          <Plus size={16} /> Νέα κριτική
        </button>
      </div>

      {editing && (
        <form onSubmit={save} className="admin-card grid gap-3 p-6 md:grid-cols-2">
          <input
            required
            placeholder="Όνομα συγγραφέα"
            className="rounded-xl border border-[var(--border)] px-3 py-2"
            value={form.authorName}
            onChange={(e) => setForm({ ...form, authorName: e.target.value })}
          />
          <select
            className="rounded-xl border border-[var(--border)] px-3 py-2"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} αστέρια
              </option>
            ))}
          </select>
          <textarea
            required
            placeholder="Κείμενο κριτικής"
            className="rounded-xl border border-[var(--border)] px-3 py-2 md:col-span-2"
            rows={4}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <input
            placeholder="Πηγή (π.χ. Google, Instagram)"
            className="rounded-xl border border-[var(--border)] px-3 py-2"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          />
          <input
            placeholder="URL πηγής"
            className="rounded-xl border border-[var(--border)] px-3 py-2"
            value={form.sourceUrl}
            onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
            />
            Δημοσιευμένη
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Featured
          </label>
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

      <div className="space-y-3">
        {loading ? (
          <p className="text-warm-gray">Φόρτωση…</p>
        ) : reviews.length === 0 ? (
          <div className="admin-card p-8 text-center text-warm-gray">
            Δεν υπάρχουν κριτικές. Προσθέστε πραγματικές μαρτυρίες πελατισσών.
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="admin-card p-5">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{r.authorName}</p>
                  <div className="mt-1 flex items-center gap-1 text-pink">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`rounded-full border px-3 py-1 text-xs ${r.published ? "border-mint bg-mint-soft" : "border-[var(--border)]"}`}
                    onClick={() => togglePublish(r)}
                  >
                    {r.published ? "Δημοσιευμένη" : "Πρόχειρη"}
                  </button>
                  <button
                    type="button"
                    className="text-xs text-pink hover:underline"
                    onClick={() => {
                      setForm({
                        id: r.id,
                        authorName: r.authorName,
                        rating: r.rating,
                        content: r.content,
                        source: r.source,
                        sourceUrl: r.sourceUrl || "",
                        published: r.published,
                        featured: r.featured,
                        displayOrder: r.displayOrder,
                      });
                      setEditing(true);
                    }}
                  >
                    Επεξεργασία
                  </button>
                  <button
                    type="button"
                    className="text-xs text-warm-gray hover:underline"
                    onClick={() => remove(r.id)}
                  >
                    Διαγραφή
                  </button>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-charcoal/90">{r.content}</p>
              <p className="mt-2 text-xs text-warm-gray">Πηγή: {r.source}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

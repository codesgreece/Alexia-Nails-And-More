"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Star, Trash2, Upload } from "lucide-react";
import { uploadFile } from "@/components/admin/StatusBadge";

type GalleryImage = {
  id: string;
  title?: string | null;
  alt?: string | null;
  imageUrl: string;
  category: string;
  featured: boolean;
  displayOrder: number;
};

const CATEGORIES = ["Nails", "Manicure", "Pedicure", "Nail Art", "Studio", "Other"];

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/gallery");
    const data = await res.json();
    setImages(data.images || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: url,
            title: file.name,
            alt: file.name,
            category: "Nails",
          }),
        });
      }
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Σφάλμα ανεβάσματος");
    } finally {
      setUploading(false);
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    await fetch(`/api/admin/gallery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Διαγραφή εικόνας;")) return;
    await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
    load();
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = images.findIndex((i) => i.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= images.length) return;
    const next = [...images];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setImages(next);
    await fetch("/api/admin/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: next.map((i) => i.id) }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Media</p>
          <h1 className="font-display text-3xl md:text-4xl">Gallery</h1>
        </div>
        <label className="btn-primary !px-4 !py-2.5 cursor-pointer text-sm">
          <Upload size={16} />
          {uploading ? "Ανέβασμα…" : "Ανέβασμα"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => onUpload(e.target.files)}
          />
        </label>
      </div>

      {loading ? (
        <p className="text-warm-gray">Φόρτωση…</p>
      ) : images.length === 0 ? (
        <div className="admin-card p-10 text-center text-warm-gray">
          Δεν υπάρχουν εικόνες ακόμα.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((img, idx) => (
            <div key={img.id} className="admin-card overflow-hidden">
              <div className="relative aspect-square bg-bg-soft">
                <Image src={img.imageUrl} alt={img.alt || ""} fill className="object-cover" />
              </div>
              <div className="space-y-2 p-3">
                <input
                  className="w-full rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                  defaultValue={img.title || ""}
                  placeholder="Τίτλος"
                  onBlur={(e) => patch(img.id, { title: e.target.value })}
                />
                <select
                  className="w-full rounded-lg border border-[var(--border)] px-2 py-1.5 text-sm"
                  value={img.category}
                  onChange={(e) => patch(img.id, { category: e.target.value })}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between gap-1">
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs ${img.featured ? "bg-pink-soft text-pink" : "text-warm-gray"}`}
                    onClick={() => patch(img.id, { featured: !img.featured })}
                  >
                    <Star size={14} /> Featured
                  </button>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      className="rounded-lg border border-[var(--border)] p-1 disabled:opacity-30"
                      onClick={() => move(img.id, -1)}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      className="rounded-lg border border-[var(--border)] p-1 disabled:opacity-30"
                      onClick={() => move(img.id, 1)}
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-[var(--border)] p-1 text-pink"
                      onClick={() => remove(img.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

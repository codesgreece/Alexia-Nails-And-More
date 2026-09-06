"use client";

import { useEffect, useState } from "react";

type Settings = Record<string, string | number | boolean | null>;

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings));
  }, []);

  function setField(key: string, value: string | number | boolean) {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMessage(data.error || "Σφάλμα αποθήκευσης");
      return;
    }
    setSettings(data.settings);
    setMessage("Αποθηκεύτηκε επιτυχώς.");
  }

  if (!settings) {
    return <p className="text-warm-gray">Φόρτωση ρυθμίσεων…</p>;
  }

  const field = (
    key: string,
    label: string,
    opts?: { textarea?: boolean; type?: string }
  ) => (
    <label key={key} className="block text-sm font-medium">
      {label}
      {opts?.textarea ? (
        <textarea
          className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2"
          rows={4}
          value={String(settings[key] ?? "")}
          onChange={(e) => setField(key, e.target.value)}
        />
      ) : (
        <input
          type={opts?.type || "text"}
          className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2"
          value={String(settings[key] ?? "")}
          onChange={(e) =>
            setField(
              key,
              opts?.type === "number" ? Number(e.target.value) : e.target.value
            )
          }
        />
      )}
    </label>
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Ρυθμίσεις</p>
        <h1 className="font-display text-3xl md:text-4xl">Επιχείρηση & περιεχόμενο</h1>
      </div>

      <form onSubmit={save} className="space-y-6">
        <section className="admin-card grid gap-4 p-6 md:grid-cols-2">
          <h2 className="font-display text-xl md:col-span-2">Στοιχεία επιχείρησης</h2>
          {field("businessName", "Επωνυμία")}
          {field("ownerName", "Ιδιοκτήτρια")}
          {field("phone", "Τηλέφωνο")}
          {field("email", "Email")}
          {field("addressLine1", "Διεύθυνση")}
          {field("addressLine2", "Διεύθυνση 2")}
          {field("city", "Πόλη")}
          {field("region", "Περιοχή")}
          {field("postalCode", "Τ.Κ.")}
        </section>

        <section className="admin-card grid gap-4 p-6 md:grid-cols-2">
          <h2 className="font-display text-xl md:col-span-2">Social</h2>
          {field("instagramUrl", "Instagram URL")}
          {field("instagramHandle", "Instagram handle")}
          {field("facebookUrl", "Facebook URL")}
          {field("whatsappNumber", "WhatsApp")}
        </section>

        <section className="admin-card grid gap-4 p-6 md:grid-cols-2">
          <h2 className="font-display text-xl md:col-span-2">Hero & About</h2>
          {field("heroEyebrow", "Hero eyebrow")}
          {field("logoUrl", "Logo URL")}
          {field("heroTitle", "Hero τίτλος", { textarea: true })}
          {field("heroSubtitle", "Hero υπότιτλος", { textarea: true })}
          {field("heroImageUrl", "Hero εικόνα URL")}
          {field("aboutTitle", "About τίτλος")}
          <div className="md:col-span-2">{field("aboutText", "About κείμενο", { textarea: true })}</div>
          <div className="md:col-span-2">
            {field("brandStatement", "Brand statement", { textarea: true })}
          </div>
        </section>

        <section className="admin-card grid gap-4 p-6 md:grid-cols-2">
          <h2 className="font-display text-xl md:col-span-2">Κρατήσεις</h2>
          {field("bookingSlotMinutes", "Διάστημα slots (λεπτά)", { type: "number" })}
          {field("bookingLeadHours", "Ελάχιστο προβάδισμα (ώρες)", { type: "number" })}
          {field("bookingMaxDays", "Μέγιστες ημέρες μπροστά", { type: "number" })}
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={Boolean(settings.emailNotifications)}
              onChange={(e) => setField("emailNotifications", e.target.checked)}
            />
            Email ειδοποιήσεις ενεργές
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input
              type="checkbox"
              checked={Boolean(settings.smtpConfigured)}
              onChange={(e) => setField("smtpConfigured", e.target.checked)}
            />
            SMTP ρυθμισμένο
          </label>
        </section>

        <section className="admin-card grid gap-4 p-6 md:grid-cols-2">
          <h2 className="font-display text-xl md:col-span-2">SEO</h2>
          {field("metaTitle", "Meta title")}
          <div className="md:col-span-2">
            {field("metaDescription", "Meta description", { textarea: true })}
          </div>
          {field("mapEmbedUrl", "Map embed URL")}
          {field("mapsDirectionsUrl", "Directions URL")}
        </section>

        {message && <p className="text-sm text-pink">{message}</p>}
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Αποθήκευση…" : "Αποθήκευση ρυθμίσεων"}
        </button>
      </form>
    </div>
  );
}

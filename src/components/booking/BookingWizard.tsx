"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { formatDateGR } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  category: { name: string };
};

type Staff = {
  id: string;
  name: string;
  color: string;
  photoUrl: string | null;
};

type Slot = { start: string; end: string; label: string };

const STEPS = [
  "Υπηρεσία",
  "Επαγγελματίας",
  "Ημερομηνία",
  "Ώρα",
  "Στοιχεία",
  "Επισκόπηση",
  "Επιβεβαίωση",
];

function nextOpenDates(count = 45) {
  const dates: string[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  while (dates.length < count) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) {
      dates.push(d.toISOString().slice(0, 10));
    }
  }
  return dates;
}

export function BookingWizard({ logoUrl }: { logoUrl: string }) {
  const params = useSearchParams();
  const preselected = params.get("service");
  const reduce = useReducedMotion();

  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [serviceId, setServiceId] = useState(preselected || "");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [confirmation, setConfirmation] = useState<{
    code: string;
    startAt: string;
  } | null>(null);

  const dates = useMemo(() => nextOpenDates(), []);
  const selectedService = services.find((s) => s.id === serviceId);
  const selectedStaff = staff.find((s) => s.id === staffId);

  useEffect(() => {
    fetch("/api/booking/services")
      .then((r) => r.json())
      .then((data) => {
        const categories = data.categories || [];
        const flat: Service[] = categories.flatMap(
          (cat: { name: string; services: Omit<Service, "category">[] }) =>
            (cat.services || []).map((s) => ({
              ...s,
              category: { name: cat.name },
            }))
        );
        setServices(flat);
      })
      .catch(() => setError("Αδυναμία φόρτωσης υπηρεσιών."));
  }, []);

  useEffect(() => {
    if (!serviceId) return;
    setStaff([]);
    setStaffId("");
    fetch(`/api/booking/staff?serviceId=${serviceId}`)
      .then((r) => r.json())
      .then((data) => setStaff(data.staff || data || []))
      .catch(() => setError("Αδυναμία φόρτωσης επαγγελματιών."));
  }, [serviceId]);

  useEffect(() => {
    if (!serviceId || !staffId || !date) return;
    setLoading(true);
    setSlot(null);
    fetch(
      `/api/booking/availability?serviceId=${serviceId}&staffId=${staffId}&date=${date}`
    )
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setError("Αδυναμία φόρτωσης διαθεσιμότητας."))
      .finally(() => setLoading(false));
  }, [serviceId, staffId, date]);

  function canNext() {
    if (step === 0) return Boolean(serviceId);
    if (step === 1) return Boolean(staffId);
    if (step === 2) return Boolean(date);
    if (step === 3) return Boolean(slot);
    if (step === 4) {
      return (
        form.firstName.trim() &&
        form.lastName.trim() &&
        form.phone.trim().length >= 6
      );
    }
    return true;
  }

  async function submit() {
    if (!slot) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          staffId,
          startAt: slot.start,
          ...form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Αποτυχία κράτησης");
      setConfirmation({
        code: data.appointment?.confirmationCode || data.confirmationCode,
        startAt: slot.start,
      });
      setStep(6);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Σφάλμα");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/">
          <BrandLogo src={logoUrl} alt="Alexia Nails & More" className="h-10 max-w-[160px]" priority />
        </Link>
        <p className="text-xs tracking-[0.18em] text-warm-gray uppercase">
          Online Booking
        </p>
      </div>

      <div className="mb-8 flex gap-1 overflow-x-auto pb-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`min-w-fit rounded-full px-3 py-1.5 text-xs font-medium ${
              i === step
                ? "bg-pink text-white"
                : i < step
                  ? "bg-pink-soft text-pink"
                  : "bg-bg-soft text-warm-gray"
            }`}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-pink/30 bg-pink-soft/50 px-4 py-3 text-sm text-pink">
          {error}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduce ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
          className="rounded-[1.6rem] border border-border bg-white p-5 shadow-[0_18px_50px_rgba(48,48,48,0.06)] md:p-8"
        >
          {step === 0 && (
            <div className="space-y-3">
              <h1 className="font-display text-3xl text-charcoal">Επιλέξτε υπηρεσία</h1>
              <div className="mt-4 max-h-[55vh] space-y-2 overflow-y-auto pr-1">
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setServiceId(s.id);
                      setError("");
                    }}
                    onDoubleClick={() => {
                      setServiceId(s.id);
                      setError("");
                      setStep(1);
                    }}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                      serviceId === s.id
                        ? "border-pink bg-pink-soft/40"
                        : "border-border hover:border-pink/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs tracking-wide text-mint uppercase">{s.category?.name}</p>
                        <p className="font-semibold text-charcoal">{s.name}</p>
                        <p className="mt-1 text-sm text-warm-gray">{s.description}</p>
                      </div>
                      <span className="text-xs text-warm-gray">~{s.durationMin}&apos;</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 className="font-display text-3xl text-charcoal">Επιλέξτε επαγγελματία</h1>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {staff.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setStaffId(m.id)}
                    className={`rounded-2xl border p-5 text-center transition ${
                      staffId === m.id ? "border-pink bg-pink-soft/40" : "border-border"
                    }`}
                  >
                    <div
                      className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold text-white"
                      style={{ background: m.color }}
                    >
                      {m.name.charAt(0)}
                    </div>
                    <p className="font-semibold">{m.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="font-display text-3xl text-charcoal">Επιλέξτε ημερομηνία</h1>
              <p className="mt-2 text-sm text-warm-gray">Κυριακή κλειστά — δεν εμφανίζεται.</p>
              <div className="mt-6 grid max-h-[50vh] grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
                {dates.map((d) => {
                  const label = formatDateGR(new Date(`${d}T12:00:00`));
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDate(d)}
                      className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                        date === d ? "border-pink bg-pink-soft/40" : "border-border"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="font-display text-3xl text-charcoal">Διαθέσιμες ώρες</h1>
              {loading ? (
                <p className="mt-6 text-warm-gray">Έλεγχος διαθεσιμότητας…</p>
              ) : slots.length === 0 ? (
                <p className="mt-6 text-warm-gray">Δεν υπάρχουν διαθέσιμες ώρες για αυτή την ημέρα.</p>
              ) : (
                <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((s) => (
                    <button
                      key={s.start}
                      type="button"
                      onClick={() => setSlot(s)}
                      className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                        slot?.start === s.start
                          ? "border-pink bg-pink text-white"
                          : "border-border hover:border-pink/40"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="font-display text-3xl text-charcoal">Τα στοιχεία σας</h1>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["firstName", "Όνομα", "text"],
                    ["lastName", "Επώνυμο", "text"],
                    ["phone", "Τηλέφωνο", "tel"],
                    ["email", "Email (προαιρετικό)", "email"],
                  ] as const
                ).map(([key, label, type]) => (
                  <label key={key} className="block text-sm">
                    <span className="mb-1.5 block text-warm-gray">{label}</span>
                    <input
                      type={type}
                      className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-pink"
                      value={form[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      required={key !== "email"}
                    />
                  </label>
                ))}
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1.5 block text-warm-gray">Σημειώσεις</span>
                  <textarea
                    className="min-h-24 w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-pink"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </label>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h1 className="font-display text-3xl text-charcoal">Επισκόπηση κράτησης</h1>
              <dl className="mt-6 space-y-3 text-sm">
                {[
                  ["Υπηρεσία", selectedService?.name],
                  ["Επαγγελματίας", selectedStaff?.name],
                  ["Ημερομηνία", date ? formatDateGR(new Date(`${date}T12:00:00`)) : ""],
                  ["Ώρα", slot?.label],
                  ["Όνομα", `${form.firstName} ${form.lastName}`],
                  ["Τηλέφωνο", form.phone],
                  ["Email", form.email || "—"],
                  ["Σημειώσεις", form.notes || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-border py-2">
                    <dt className="text-warm-gray">{k}</dt>
                    <dd className="text-right font-medium text-charcoal">{v}</dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                className="btn-primary mt-8 w-full"
                disabled={loading}
                onClick={submit}
              >
                {loading ? "Καταχώρηση…" : "Επιβεβαίωση Ραντεβού"}
              </button>
            </div>
          )}

          {step === 6 && confirmation && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mint/30 text-mint">
                <Check className="h-7 w-7" />
              </div>
              <h1 className="font-display text-3xl text-charcoal">Το ραντεβού καταχωρήθηκε</h1>
              <p className="mt-3 text-warm-gray">
                Κωδικός επιβεβαίωσης:{" "}
                <strong className="text-pink">{confirmation.code}</strong>
              </p>
              <p className="mt-2 text-sm text-warm-gray">
                {formatDateGR(new Date(confirmation.startAt))} ·{" "}
                {new Date(confirmation.startAt).toLocaleTimeString("el-GR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <Link href="/" className="btn-primary mt-8 inline-flex">
                Επιστροφή στην αρχική
              </Link>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {step < 5 ? (
        <div className="relative z-[70] mt-6 mb-28 flex justify-between md:mb-6">
          <button
            type="button"
            className="btn-secondary"
            disabled={step === 0}
            onClick={() => {
              setError("");
              setStep((s) => Math.max(0, s - 1));
            }}
          >
            <ChevronLeft className="h-4 w-4" /> Πίσω
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={!canNext()}
            onClick={() => {
              setError("");
              setStep((s) => s + 1);
            }}
          >
            Συνέχεια <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

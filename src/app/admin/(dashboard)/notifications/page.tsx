"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { formatDateGR, formatTimeGR } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  status: string;
  channel: string;
  recipient: string;
  subject?: string | null;
  body: string;
  error?: string | null;
  createdAt: string;
  scheduledFor?: string | null;
  sentAt?: string | null;
  appointment?: {
    id: string;
    confirmationCode: string;
    startAt: string;
  } | null;
};

const STATUS_FILTERS = ["", "PENDING", "SENT", "FAILED", "SKIPPED"];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = status ? `?status=${status}` : "";
    const res = await fetch(`/api/admin/notifications${qs}`);
    const data = await res.json();
    setNotifications(data.notifications || []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Ουρά</p>
        <h1 className="font-display text-3xl md:text-4xl">Ειδοποιήσεις</h1>
        <p className="mt-1 text-sm text-warm-gray">
          Καταγεγραμμένες ειδοποιήσεις. Χωρίς SMTP εμφανίζονται ως SKIPPED.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full border px-3 py-1.5 text-sm ${status === s ? "border-pink bg-pink-soft text-pink" : "border-[var(--border)]"}`}
          >
            {s || "Όλες"}
          </button>
        ))}
      </div>

      <div className="admin-card overflow-x-auto">
        {loading ? (
          <p className="p-8 text-center text-warm-gray">Φόρτωση…</p>
        ) : notifications.length === 0 ? (
          <p className="p-8 text-center text-warm-gray">Καμία ειδοποίηση.</p>
        ) : (
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-bg-soft text-warm-gray">
              <tr>
                <th className="px-4 py-3 font-medium">Ημ/νία</th>
                <th className="px-4 py-3 font-medium">Τύπος</th>
                <th className="px-4 py-3 font-medium">Παραλήπτης</th>
                <th className="px-4 py-3 font-medium">Κατάσταση</th>
                <th className="px-4 py-3 font-medium">Θέμα</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <Fragment key={n.id}>
                  <tr className="border-b border-[var(--border)]">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>{formatDateGR(n.createdAt)}</div>
                      <div className="text-xs text-warm-gray">{formatTimeGR(n.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{n.type}</td>
                    <td className="px-4 py-3">{n.recipient}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-xs">
                        {n.status}
                      </span>
                    </td>
                    <td className="max-w-[240px] truncate px-4 py-3">{n.subject || "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-pink hover:underline"
                        onClick={() => setExpanded(expanded === n.id ? null : n.id)}
                      >
                        {expanded === n.id ? "Κλείσιμο" : "Λεπτομέρειες"}
                      </button>
                    </td>
                  </tr>
                  {expanded === n.id && (
                    <tr className="border-b border-[var(--border)] bg-bg-soft/60">
                      <td colSpan={6} className="px-4 py-4">
                        <pre className="whitespace-pre-wrap text-xs text-charcoal/80">{n.body}</pre>
                        {n.error && (
                          <p className="mt-2 text-xs text-pink">Σφάλμα: {n.error}</p>
                        )}
                        {n.appointment && (
                          <p className="mt-2 text-xs text-warm-gray">
                            Ραντεβού {n.appointment.confirmationCode} ·{" "}
                            {formatDateGR(n.appointment.startAt)}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

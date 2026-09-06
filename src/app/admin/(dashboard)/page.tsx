"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { CalendarPlus, Users, Sparkles, Clock } from "lucide-react";
import { formatDateGR, formatTimeGR } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";

type Stats = {
  today: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  total: number;
  week: number;
  month: number;
  todayAppointments: Array<{
    id: string;
    startAt: string;
    endAt: string;
    status: string;
    confirmationCode: string;
    customer: { firstName: string; lastName: string; phone: string };
    staff: { name: string; color: string };
    service: { name: string };
  }>;
  chartWeek: Array<{ name: string; count: number }>;
  statusBreakdown: Array<{ name: string; value: number }>;
};

const PIE_COLORS = ["#D91B73", "#91C8C0", "#1E3A8A", "#858385"];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(async (r) => {
        if (!r.ok) throw new Error("Αποτυχία φόρτωσης");
        return r.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="admin-card p-6 text-pink">{error}</div>;
  }

  if (!stats) {
    return (
      <div className="admin-card flex h-64 items-center justify-center text-warm-gray">
        Φόρτωση επισκόπησης…
      </div>
    );
  }

  const cards = [
    { label: "Σήμερα", value: stats.today, hint: "ραντεβού" },
    { label: "Επερχόμενα", value: stats.upcoming, hint: "ενεργά" },
    { label: "Εβδομάδα", value: stats.week, hint: "σύνολο" },
    { label: "Μήνας", value: stats.month, hint: "σύνολο" },
    { label: "Ολοκληρωμένα", value: stats.completed, hint: "σύνολο" },
    { label: "Ακυρωμένα", value: stats.cancelled, hint: "σύνολο" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="font-display text-3xl text-charcoal md:text-4xl">Επισκόπηση</h1>
          <p className="mt-1 text-warm-gray">{formatDateGR(new Date())}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/appointments" className="btn-primary !px-4 !py-2.5 text-sm">
            <CalendarPlus size={16} /> Νέο ραντεβού
          </Link>
          <Link href="/admin/calendar" className="btn-secondary !px-4 !py-2.5 text-sm">
            <Clock size={16} /> Ημερολόγιο
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="admin-card p-5">
            <p className="text-sm text-warm-gray">{c.label}</p>
            <p className="mt-2 font-display text-4xl text-charcoal">{c.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-pink">{c.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="admin-card p-5 lg:col-span-2">
          <h2 className="mb-4 font-display text-xl">Εβδομαδιαία δραστηριότητα</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartWeek}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{ fill: "#858385", fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: "#858385", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Ραντεβού" fill="#D91B73" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card p-5">
          <h2 className="mb-4 font-display text-xl">Κατάσταση</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {stats.statusBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="admin-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Σημερινό πρόγραμμα</h2>
            <Link href="/admin/calendar" className="text-sm font-medium text-pink hover:underline">
              Προβολή όλων
            </Link>
          </div>
          {stats.todayAppointments.length === 0 ? (
            <p className="py-8 text-center text-warm-gray">Κανένα ραντεβού σήμερα.</p>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {stats.todayAppointments.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span
                    className="h-10 w-1.5 rounded-full"
                    style={{ background: a.staff.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {formatTimeGR(a.startAt)} · {a.customer.firstName} {a.customer.lastName}
                    </p>
                    <p className="text-sm text-warm-gray">
                      {a.service.name} · {a.staff.name}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-card space-y-3 p-5">
          <h2 className="font-display text-xl">Γρήγορες ενέργειες</h2>
          <Link
            href="/admin/appointments"
            className="flex items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-3 transition hover:border-pink"
          >
            <CalendarPlus className="text-pink" size={18} /> Νέο ραντεβού
          </Link>
          <Link
            href="/admin/customers"
            className="flex items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-3 transition hover:border-pink"
          >
            <Users className="text-pink" size={18} /> Πελάτισσες
          </Link>
          <Link
            href="/admin/services"
            className="flex items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-3 transition hover:border-pink"
          >
            <Sparkles className="text-pink" size={18} /> Υπηρεσίες
          </Link>
          <p className="pt-2 text-sm text-warm-gray">Σύνολο ραντεβού: {stats.total}</p>
        </div>
      </div>
    </div>
  );
}

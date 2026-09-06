import { NextResponse } from "next/server";
import { endOfDay, endOfMonth, endOfWeek, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    today,
    upcoming,
    completed,
    cancelled,
    total,
    week,
    month,
    todayAppointments,
    weekByDay,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { startAt: { gte: todayStart, lte: todayEnd }, status: { not: "CANCELLED" } },
    }),
    prisma.appointment.count({
      where: {
        startAt: { gte: now },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    prisma.appointment.count({ where: { status: "COMPLETED" } }),
    prisma.appointment.count({ where: { status: "CANCELLED" } }),
    prisma.appointment.count(),
    prisma.appointment.count({
      where: {
        startAt: { gte: weekStart, lte: weekEnd },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.appointment.count({
      where: {
        startAt: { gte: monthStart, lte: monthEnd },
        status: { not: "CANCELLED" },
      },
    }),
    prisma.appointment.findMany({
      where: { startAt: { gte: todayStart, lte: todayEnd } },
      orderBy: { startAt: "asc" },
      include: {
        customer: true,
        staff: true,
        service: true,
      },
    }),
    prisma.appointment.findMany({
      where: {
        startAt: { gte: weekStart, lte: weekEnd },
        status: { not: "CANCELLED" },
      },
      select: { startAt: true, status: true },
    }),
  ]);

  const dayNames = ["Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ", "Κυρ"];
  const chartWeek = dayNames.map((name, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const count = weekByDay.filter((a) => a.startAt.toISOString().slice(0, 10) === key).length;
    return { name, count };
  });

  const statusBreakdown = [
    { name: "Εκκρεμή", value: await prisma.appointment.count({ where: { status: "PENDING" } }) },
    { name: "Επιβεβαιωμένα", value: await prisma.appointment.count({ where: { status: "CONFIRMED" } }) },
    { name: "Ολοκληρωμένα", value: completed },
    { name: "Ακυρωμένα", value: cancelled },
  ];

  return NextResponse.json({
    today,
    upcoming,
    completed,
    cancelled,
    total,
    week,
    month,
    todayAppointments,
    chartWeek,
    statusBreakdown,
  });
}

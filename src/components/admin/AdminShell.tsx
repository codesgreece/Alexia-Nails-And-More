"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  Users,
  UserRound,
  Sparkles,
  Images,
  Star,
  Settings,
  Clock3,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Επισκόπηση", icon: LayoutDashboard, exact: true },
  { href: "/admin/appointments", label: "Ραντεβού", icon: CalendarDays },
  { href: "/admin/calendar", label: "Ημερολόγιο", icon: CalendarRange },
  { href: "/admin/customers", label: "Πελάτισσες", icon: Users },
  { href: "/admin/staff", label: "Προσωπικό", icon: UserRound },
  { href: "/admin/services", label: "Υπηρεσίες", icon: Sparkles },
  { href: "/admin/gallery", label: "Gallery", icon: Images },
  { href: "/admin/reviews", label: "Κριτικές", icon: Star },
  { href: "/admin/hours", label: "Ωράριο", icon: Clock3 },
  { href: "/admin/notifications", label: "Ειδοποιήσεις", icon: Bell },
  { href: "/admin/settings", label: "Ρυθμίσεις", icon: Settings },
];

export function AdminShell({
  children,
  adminName,
  logoUrl,
}: {
  children: React.ReactNode;
  adminName?: string | null;
  logoUrl?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="admin-shell flex min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[var(--border)] bg-white transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-5">
          <BrandLogo
            src={logoUrl || "/images/alexia-logo.png"}
            alt="Alexia Nails & More"
            className="h-11 w-11 rounded-full object-cover"
          />
          <div>
            <p className="font-display text-lg leading-tight text-charcoal">Alexia Nails</p>
            <p className="text-xs tracking-[0.18em] text-pink uppercase">& More · Admin</p>
          </div>
          <button
            type="button"
            className="ml-auto rounded-lg p-2 text-warm-gray lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Κλείσιμο μενού"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[color-mix(in_srgb,var(--pink)_10%,white)] text-pink"
                    : "text-charcoal/80 hover:bg-bg-soft hover:text-charcoal"
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border)] p-4">
          <p className="mb-3 truncate text-sm text-warm-gray">{adminName || "Διαχειριστής"}</p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm font-medium text-charcoal transition hover:border-pink hover:text-pink"
          >
            <LogOut size={16} />
            Αποσύνδεση
          </button>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-charcoal/30 lg:hidden"
          aria-label="Κλείσιμο"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--border)] bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            className="rounded-lg border border-[var(--border)] p-2"
            onClick={() => setOpen(true)}
            aria-label="Άνοιγμα μενού"
          >
            <Menu size={18} />
          </button>
          <span className="font-display text-lg">Admin</span>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

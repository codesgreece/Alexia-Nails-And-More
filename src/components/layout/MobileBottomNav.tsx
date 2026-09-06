"use client";

import Link from "next/link";
import { CalendarHeart, Grid2X2, Home, Images, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/#home", label: "Αρχική", icon: Home },
  { href: "/#services", label: "Υπηρεσίες", icon: Grid2X2 },
  { href: "/booking", label: "Ραντεβού", icon: CalendarHeart },
  { href: "/#gallery", label: "Gallery", icon: Images },
  { href: "/#contact", label: "Menu", icon: Menu },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav
      aria-label="Mobile sticky navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5 gap-1">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/booking" && pathname === "/booking";
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium",
                  active ? "text-pink" : "text-warm-gray"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

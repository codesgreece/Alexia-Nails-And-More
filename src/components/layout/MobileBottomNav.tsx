"use client";

import Link from "next/link";
import { CalendarHeart, Grid2X2, Home, Images, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/#home", id: "home", label: "Αρχική", icon: Home },
  { href: "/#services", id: "services", label: "Υπηρεσίες", icon: Grid2X2 },
  { href: "/booking", id: "booking", label: "Ραντεβού", icon: CalendarHeart },
  { href: "/#gallery", id: "gallery", label: "Gallery", icon: Images },
  { href: "/#contact", id: "contact", label: "Menu", icon: Menu },
] as const;

function resolveActiveId(pathname: string | null, hash: string) {
  if (pathname === "/booking") return "booking";
  if (pathname !== "/") return null;

  const section = hash.replace("#", "");
  if (section === "services") return "services";
  if (section === "gallery") return "gallery";
  if (section === "contact") return "contact";
  return "home";
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const activeId = resolveActiveId(pathname, hash);

  return (
    <nav
      aria-label="Mobile sticky navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <ul className="nav-liquid-glass pointer-events-auto relative flex w-full max-w-[22.5rem] items-stretch gap-0.5 rounded-full p-1.5">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeId === item.id;

          return (
            <li key={item.href} className="relative min-w-0 flex-1">
              <Link
                href={item.href}
                onClick={() => {
                  if (item.href.includes("#")) {
                    setHash(`#${item.id === "home" ? "home" : item.id}`);
                  }
                }}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative z-10 flex h-full flex-col items-center justify-center gap-0.5 rounded-full px-1 py-2 text-[10px] font-medium tracking-wide transition-colors duration-300",
                  active ? "text-white" : "text-white/55 hover:text-white/85"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-nav-active-pill"
                    className="nav-liquid-active absolute inset-0 -z-10 rounded-full"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <Icon
                  className={cn(
                    "h-[1.15rem] w-[1.15rem] transition-transform duration-300",
                    active && "scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]"
                  )}
                  strokeWidth={active ? 2.25 : 1.85}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

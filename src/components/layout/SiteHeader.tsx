"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { cn, formatPhoneLink } from "@/lib/utils";

const NAV = [
  { href: "/#home", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/#gallery", label: "Gallery" },
  { href: "/#team", label: "Team" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader({
  logoUrl,
  businessName,
  phone,
  instagramUrl,
}: {
  logoUrl: string;
  businessName: string;
  phone: string;
  instagramUrl: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/90 shadow-[0_8px_30px_rgba(48,48,48,0.06)] backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        <div className="container-premium flex h-[72px] items-center justify-between md:h-[84px]">
          <Link href="/" className="focus-ring rounded-lg" aria-label={businessName}>
            <BrandLogo
              src={logoUrl}
              alt={businessName}
              className="h-10 max-w-[150px] md:h-12"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Κύριο μενού">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring text-sm font-medium text-charcoal/80 transition hover:text-pink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={formatPhoneLink(phone)}
              className="focus-ring rounded-full p-2 text-charcoal hover:text-pink"
              aria-label="Κλήση"
            >
              <Phone className="h-4 w-4" />
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring rounded-full p-2 text-charcoal hover:text-pink"
              aria-label="Instagram"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <Link href="/booking" className="btn-primary text-sm">
              Κλείσε Ραντεβού
            </Link>
          </div>

          <button
            type="button"
            className="focus-ring rounded-full p-2 lg:hidden"
            aria-label={open ? "Κλείσιμο μενού" : "Άνοιγμα μενού"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 bg-white pt-24 lg:hidden">
          <nav className="container-premium flex flex-col gap-5" aria-label="Mobile menu">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-display text-3xl text-charcoal"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/booking"
              className="btn-primary mt-4 w-fit"
              onClick={() => setOpen(false)}
            >
              Κλείσε Ραντεβού
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}

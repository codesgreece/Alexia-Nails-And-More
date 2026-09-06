"use client";

import Link from "next/link";
import { CalendarHeart, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { formatPhoneLink } from "@/lib/utils";

export function FloatingActions({
  phone,
  instagramUrl,
}: {
  phone: string;
  instagramUrl: string;
}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname === "/booking") return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-2 md:bottom-8">
      <Link
        href="/booking"
        className="btn-primary shadow-lg md:hidden"
        aria-label="Κλείσε Ραντεβού"
      >
        <CalendarHeart className="h-4 w-4" />
        Κλείσε Ραντεβού
      </Link>
      <div className="flex flex-col gap-2 self-end">
        <a
          href={formatPhoneLink(phone)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal text-white shadow-lg transition hover:bg-pink"
          aria-label="Κλήση"
        >
          <Phone className="h-5 w-5" />
        </a>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-pink text-white shadow-lg transition hover:scale-105"
          aria-label="Instagram"
        >
          <InstagramIcon className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Book, CalendarHeart, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { cn, formatPhoneLink } from "@/lib/utils";

const bubbleClass =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-lg transition hover:scale-105";

export function FloatingActions({
  phone,
  instagramUrl,
}: {
  phone: string;
  instagramUrl: string;
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setExpanded(false), 10_000);
    return () => window.clearTimeout(timer);
  }, []);

  if (pathname?.startsWith("/admin") || pathname === "/booking") return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2 md:bottom-8">
      <Link
        href="/booking"
        className={cn(
          "md:hidden",
          expanded
            ? "btn-primary shadow-lg transition-transform duration-300"
            : cn(bubbleClass, "bg-pink text-white duration-300")
        )}
        aria-label="Κλείσε Ραντεβού"
        title="Κλείσε Ραντεβού"
      >
        {expanded ? (
          <>
            <CalendarHeart className="h-4 w-4 shrink-0 text-white" />
            <span>Κλείσε Ραντεβού</span>
          </>
        ) : (
          <Book className="h-5 w-5 text-white" aria-hidden="true" />
        )}
      </Link>

      <a
        href={formatPhoneLink(phone)}
        className={cn(bubbleClass, "bg-charcoal hover:bg-pink")}
        aria-label="Κλήση"
        title="Κλήση"
      >
        <Phone className="h-5 w-5 text-white" stroke="white" aria-hidden="true" />
      </a>

      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(bubbleClass, "bg-pink")}
        aria-label="Instagram"
        title="Instagram"
      >
        <InstagramIcon className="h-5 w-5 text-white" aria-hidden="true" />
      </a>
    </div>
  );
}

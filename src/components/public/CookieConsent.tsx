"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("alexia-cookie-consent");
    if (!saved) setOpen(true);
  }, []);

  function accept(value: "all" | "essential") {
    localStorage.setItem("alexia-cookie-consent", value);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Συγκατάθεση cookies"
      className="fixed bottom-4 left-4 right-4 z-[90] mx-auto max-w-xl rounded-2xl border border-border bg-white p-5 shadow-[0_20px_60px_rgba(48,48,48,0.15)] md:bottom-6 md:left-6 md:right-auto"
    >
      <p className="font-display text-2xl text-charcoal">Cookies & Ιδιωτικότητα</p>
      <p className="mt-2 text-sm leading-relaxed text-warm-gray">
        Χρησιμοποιούμε απαραίτητα cookies για τη λειτουργία του site. Μη απαραίτητα
        tracking scripts φορτώνονται μόνο μετά τη συγκατάθεσή σας.{" "}
        <Link href="/cookies" className="text-pink underline-offset-2 hover:underline">
          Πολιτική Cookies
        </Link>
        {" · "}
        <Link href="/privacy" className="text-pink underline-offset-2 hover:underline">
          Απορρήτου
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-primary text-sm" onClick={() => accept("all")}>
          Αποδοχή όλων
        </button>
        <button type="button" className="btn-secondary text-sm" onClick={() => accept("essential")}>
          Μόνο απαραίτητα
        </button>
      </div>
    </div>
  );
}

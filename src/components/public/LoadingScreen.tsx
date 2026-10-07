"use client";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function LoadingScreen({
  logoUrl,
  businessName,
}: {
  logoUrl: string;
  businessName: string;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const [visible, setVisible] = useState(!isAdmin);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      setVisible(false);
      return;
    }
    setVisible(true);
    setFade(false);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t1 = setTimeout(() => setFade(true), reduce ? 200 : 900);
    const t2 = setTimeout(() => setVisible(false), reduce ? 350 : 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isAdmin]);

  if (!visible || isAdmin) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        fade ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={!visible}
      role="status"
    >
      <BrandLogo
        src={logoUrl}
        alt={businessName}
        className="mb-6 h-16 w-auto max-w-[200px] animate-fade-up"
        priority
      />
      <div className="loading-line mb-4" />
      <p className="text-xs tracking-[0.28em] text-warm-gray uppercase">
        {businessName}
      </p>
      <span className="sr-only">Loading...</span>
      <p className="mt-2 text-sm text-warm-gray">Loading...</p>
    </div>
  );
}

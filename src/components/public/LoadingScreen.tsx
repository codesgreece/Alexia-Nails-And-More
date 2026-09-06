"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function LoadingScreen({
  logoUrl,
  businessName,
}: {
  logoUrl: string;
  businessName: string;
}) {
  const [visible, setVisible] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t1 = setTimeout(() => setFade(true), reduce ? 200 : 900);
    const t2 = setTimeout(() => setVisible(false), reduce ? 350 : 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        fade ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={!visible}
      role="status"
    >
      <Image
        src={logoUrl}
        alt={businessName}
        width={220}
        height={80}
        className="mb-6 h-auto w-[180px] animate-fade-up"
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

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function HeroSection({
  logoUrl,
  businessName,
  eyebrow,
  title,
  subtitle,
  imageUrl,
}: {
  logoUrl: string;
  businessName: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}) {
  const reduce = useReducedMotion();

  return (
    <section id="home" className="relative min-h-[100svh] overflow-hidden">
      <Image
        src={imageUrl}
        alt="Alexia Nails & More — premium nail care"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/88 to-white/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40" />

      {!reduce && (
        <>
          <div className="polish-blob left-[-80px] top-[20%] h-72 w-72 bg-pink" />
          <div
            className="polish-blob right-[10%] bottom-[10%] h-64 w-64 bg-mint"
            style={{ animationDelay: "2s" }}
          />
        </>
      )}

      <div className="container-premium relative z-10 flex min-h-[100svh] flex-col justify-center pb-24 pt-28">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <BrandLogo
            src={logoUrl}
            alt={businessName}
            className="mb-8 h-14 max-w-[220px] md:h-16"
            priority
          />
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h1 className="font-display text-5xl leading-[1.05] text-charcoal md:text-7xl whitespace-pre-line">
            {title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-warm-gray md:text-lg">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/booking" className="btn-primary">
              Κλείσε Ραντεβού
            </Link>
            <Link href="/#services" className="btn-secondary">
              Ανακάλυψε τις Υπηρεσίες
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setN(value);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduce]);

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

export function BrandIntro({
  statement,
  imageUrl,
}: {
  statement: string;
  imageUrl: string;
}) {
  const reduce = useReducedMotion();

  return (
    <section className="section-pad marble-bg overflow-hidden">
      <div className="container-premium grid items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow mb-4">Η φιλοσοφία μας</p>
          <h2 className="font-display text-4xl leading-tight text-charcoal md:text-5xl whitespace-pre-line">
            {statement}
          </h2>
          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-8">
            {[
              { value: 20, suffix: "+", label: "Χρόνια εμπειρίας" },
              { value: 3, suffix: "", label: "Επαγγελματίες" },
              { value: 100, suffix: "%", label: "Προσωπική φροντίδα" },
            ].map((item) => (
              <div key={item.label}>
                <p className="font-display text-4xl text-pink md:text-5xl">
                  <Counter value={item.value} suffix={item.suffix} />
                </p>
                <p className="mt-1 text-xs tracking-wide text-warm-gray uppercase">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 1.04 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative aspect-[4/5] overflow-hidden rounded-[2rem] md:aspect-[4/3]"
        >
          <Image
            src={imageUrl}
            alt="Ο χώρος του Alexia Nails & More"
            fill
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/25 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}

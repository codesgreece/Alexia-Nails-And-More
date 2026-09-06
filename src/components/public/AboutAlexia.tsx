"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export function AboutAlexia({
  title,
  text,
  imageUrl,
}: {
  title: string;
  text: string;
  imageUrl: string;
}) {
  const reduce = useReducedMotion();
  const paragraphs = text.split("\n").filter(Boolean);

  return (
    <section id="about" className="section-pad bg-white">
      <div className="container-premium grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={reduce ? false : { opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="absolute -left-4 -top-4 h-28 w-28 rounded-full bg-mint/30 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-border">
            <Image
              src={imageUrl}
              alt="Η Αλεξία Κελεσίδου — Alexia Nails & More"
              width={900}
              height={1100}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow mb-3">Ιδιοκτήτρια</p>
          <h2 className="font-display text-4xl text-charcoal md:text-5xl">{title}</h2>
          <p className="mt-2 text-sm tracking-wide text-warm-gray">Αλεξία Κελεσίδου</p>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-charcoal/85">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "20+ χρόνια εμπειρίας",
              "Δημόσιο ΙΕΚ Αισθητικής",
              "Πιστοποίηση ΕΟΠΠΕΠ",
              "Συνεχής επιμόρφωση",
              "Γνώσεις ποδολογίας",
              "Lash & Brow Lift",
            ].map((item) => (
              <li
                key={item}
                className="rounded-full border border-border bg-bg-soft px-4 py-2 text-sm text-charcoal"
              >
                <span className="mr-2 text-pink">✦</span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { Award, HeartHandshake, Sparkles, GraduationCap, Leaf, Wand2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const FEATURES = [
  { icon: Award, title: "20+ χρόνια εμπειρίας", text: "Βαθιά γνώση που φαίνεται σε κάθε λεπτομέρεια." },
  { icon: HeartHandshake, title: "Εξειδικευμένη φροντίδα", text: "Θεραπείες προσαρμοσμένες στις ανάγκες σας." },
  { icon: GraduationCap, title: "Πιστοποιημένη γνώση", text: "ΙΕΚ Αισθητικής και πιστοποίηση ΕΟΠΠΕΠ." },
  { icon: Sparkles, title: "Προσωπική προσέγγιση", text: "Κάθε ραντεβού είναι αφιερωμένο σε εσάς." },
  { icon: Leaf, title: "Προϊόντα υψηλής ποιότητας", text: "Επιλεγμένες σειρές για ασφάλεια και αποτέλεσμα." },
  { icon: Wand2, title: "Σύγχρονες τεχνικές", text: "Συνεχής εκπαίδευση σε νέες μεθόδους." },
];

export function WhySection() {
  const reduce = useReducedMotion();

  return (
    <section className="section-pad bg-charcoal text-white">
      <div className="container-premium">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs tracking-[0.22em] text-mint uppercase">Why us</p>
          <h2 className="font-display text-4xl md:text-5xl">Why Alexia Nails & More</h2>
          <p className="mt-4 text-white/65">
            Ένας χώρος που ενώνει εμπειρία, αισθητική και ανθρώπινη φροντίδα.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-pink/20 text-pink">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{f.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

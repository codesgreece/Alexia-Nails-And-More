"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Shield,
  RefreshCw,
  Paintbrush,
  Footprints,
  HeartPulse,
  Eye,
  Scissors,
  Wand2,
  Eraser,
  Layers,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  nail: Sparkles,
  sparkle: Sparkles,
  gel: Layers,
  shield: Shield,
  tips: Wand2,
  extend: Layers,
  refresh: RefreshCw,
  art: Paintbrush,
  french: Paintbrush,
  remove: Eraser,
  foot: Footprints,
  heal: HeartPulse,
  brow: Scissors,
  lash: Eye,
};

type Service = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  durationMin: number;
};

type Category = {
  id: string;
  name: string;
  description: string | null;
  services: Service[];
};

export function ServicesSection({ categories }: { categories: Category[] }) {
  const reduce = useReducedMotion();

  return (
    <section id="services" className="section-pad bg-white">
      <div className="container-premium">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-3">Υπηρεσίες</p>
          <h2 className="font-display text-4xl text-charcoal md:text-5xl">
            Περιποίηση με υπογραφή
          </h2>
          <p className="mt-4 text-warm-gray">
            Κάθε υπηρεσία σχεδιάζεται γύρω από εσένα — χωρίς τιμές στο site,
            με επίκεντρο την εμπειρία και το αποτέλεσμα.
          </p>
        </div>

        <div className="mt-14 space-y-16">
          {categories.map((cat) => (
            <div key={cat.id}>
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-display text-3xl text-charcoal">{cat.name}</h3>
                  {cat.description ? (
                    <p className="mt-1 text-sm text-warm-gray">{cat.description}</p>
                  ) : null}
                </div>
                <div className="hidden h-px flex-1 bg-gradient-to-r from-pink/40 to-transparent md:block" />
              </div>

              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3">
                {cat.services.map((svc, i) => {
                  const Icon = ICONS[svc.icon || "nail"] || Sparkles;
                  return (
                    <motion.article
                      key={svc.id}
                      initial={reduce ? false : { opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ delay: reduce ? 0 : i * 0.04, duration: 0.45 }}
                      className="min-w-[78%] snap-start rounded-[1.4rem] border border-border bg-bg-soft/80 p-5 transition hover:-translate-y-1 hover:border-pink/30 hover:shadow-[0_18px_40px_rgba(217,27,115,0.08)] md:min-w-0"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-pink-soft text-pink">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h4 className="text-lg font-semibold text-charcoal">{svc.name}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-warm-gray">
                        {svc.description}
                      </p>
                      <p className="mt-3 text-xs tracking-wide text-mint uppercase">
                        Διάρκεια ~{svc.durationMin}&apos;
                      </p>
                      <Link
                        href={`/booking?service=${svc.id}`}
                        className="mt-5 inline-flex text-sm font-semibold text-pink hover:underline"
                      >
                        Κλείσε ραντεβού →
                      </Link>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

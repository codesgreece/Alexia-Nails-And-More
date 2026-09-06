"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

type ImageItem = {
  id: string;
  title: string | null;
  alt: string | null;
  imageUrl: string;
  category: string;
};

const FILTERS = ["Όλα", "Nails", "Manicure", "Pedicure", "Nail Art", "Beauty", "Salon"];

export function GallerySection({ images }: { images: ImageItem[] }) {
  const [filter, setFilter] = useState("Όλα");
  const [active, setActive] = useState<ImageItem | null>(null);
  const reduce = useReducedMotion();

  const filtered = useMemo(() => {
    if (filter === "Όλα") return images;
    return images.filter((img) => img.category === filter);
  }, [filter, images]);

  return (
    <section id="gallery" className="section-pad bg-white">
      <div className="container-premium">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-3">Gallery</p>
          <h2 className="font-display text-4xl text-charcoal md:text-5xl">Η αισθητική μας</h2>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                filter === f
                  ? "bg-pink text-white"
                  : "border border-border bg-bg-soft text-charcoal hover:border-pink/40"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filtered.map((img, i) => (
            <motion.button
              key={img.id}
              type="button"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              className="group mb-4 block w-full overflow-hidden rounded-2xl focus-ring"
              onClick={() => setActive(img)}
            >
              <Image
                src={img.imageUrl}
                alt={img.alt || img.title || "Gallery image"}
                width={800}
                height={1000}
                className="w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </motion.button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-charcoal/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Gallery lightbox"
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-white/90 p-2"
              aria-label="Κλείσιμο"
              onClick={() => setActive(null)}
            >
              <X />
            </button>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={active.imageUrl}
                alt={active.alt || active.title || "Gallery image"}
                width={1400}
                height={1600}
                className="max-h-[85vh] w-auto object-contain"
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";

type Staff = {
  id: string;
  name: string;
  photoUrl: string | null;
  bio: string | null;
  specialties: string | null;
  color: string;
};

export function TeamSection({ staff }: { staff: Staff[] }) {
  const reduce = useReducedMotion();

  return (
    <section id="team" className="section-pad marble-bg">
      <div className="container-premium">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-3">Άνθρωποι</p>
          <h2 className="font-display text-4xl text-charcoal md:text-5xl">Η ομάδα μας</h2>
          <p className="mt-4 text-warm-gray">
            Τρεις επαγγελματίες, μία κοινή δέσμευση στην ποιότητα και την προσωπική φροντίδα.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {staff.map((member, i) => (
            <motion.article
              key={member.id}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="overflow-hidden rounded-[1.6rem] border border-border bg-white"
            >
              <div
                className="relative flex aspect-[4/5] items-end justify-center bg-gradient-to-b from-bg-soft to-mint-soft"
                style={{ backgroundImage: `linear-gradient(160deg, ${member.color}22, #faf8f9 55%)` }}
              >
                {member.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.photoUrl}
                    alt={member.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="mb-10 flex h-28 w-28 items-center justify-center rounded-full border border-white/70 bg-white/70 font-display text-4xl text-charcoal shadow-sm backdrop-blur">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-display text-3xl text-charcoal">{member.name}</h3>
                {member.bio ? (
                  <p className="mt-2 text-sm text-warm-gray">{member.bio}</p>
                ) : (
                  <p className="mt-2 text-sm text-warm-gray">
                    Μέλος της ομάδας Alexia Nails & More.
                  </p>
                )}
                {member.specialties ? (
                  <p className="mt-4 text-xs tracking-wide text-pink uppercase">
                    {member.specialties}
                  </p>
                ) : null}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

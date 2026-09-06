"use client";

import { Star } from "lucide-react";
import Link from "next/link";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  content: string;
  source: string;
};

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  return (
    <section id="reviews" className="section-pad marble-bg">
      <div className="container-premium">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-3">Reviews</p>
          <h2 className="font-display text-4xl text-charcoal md:text-5xl">
            Οι δικές σας λέξεις
          </h2>
          <p className="mt-4 text-warm-gray">
            Εμφανίζουμε μόνο πραγματικές κριτικές που έχουν εγκριθεί από το studio.
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="mx-auto mt-12 max-w-xl rounded-[1.5rem] border border-dashed border-border bg-white p-10 text-center">
            <div className="mb-3 flex justify-center gap-1 text-pink">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5" />
              ))}
            </div>
            <p className="font-display text-2xl text-charcoal">Σύντομα οι δικές σας εμπειρίες</p>
            <p className="mt-3 text-sm text-warm-gray">
              Οι πραγματικές κριτικές θα εμφανίζονται εδώ μόλις προστεθούν από το admin
              ή μέσω υποστηριζόμενης Google Reviews ενσωμάτωσης.
            </p>
            <Link href="/booking" className="btn-primary mt-6 text-sm">
              Κλείσε την εμπειρία σου
            </Link>
          </div>
        ) : (
          <>
            {avg !== null ? (
              <div className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-full border border-border bg-white px-5 py-3">
                <div className="flex text-pink">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.round(avg) ? "fill-pink" : ""}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-charcoal">
                  {avg.toFixed(1)} / 5 · {reviews.length} κριτικές
                </span>
              </div>
            ) : null}
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className="rounded-[1.4rem] border border-border bg-white p-6 shadow-[0_12px_40px_rgba(48,48,48,0.04)]"
                >
                  <div className="mb-3 flex gap-1 text-pink">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < r.rating ? "fill-pink" : ""}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-charcoal/90">&ldquo;{r.content}&rdquo;</p>
                  <p className="mt-4 text-sm font-semibold text-charcoal">{r.authorName}</p>
                  <p className="text-xs text-warm-gray">{r.source}</p>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

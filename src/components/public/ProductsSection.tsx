export function ProductsSection() {
  const brands = ["Lolota", "Essie", "Gehwol", "Avgerinos Cosmetics", "Bo Nails"];

  return (
    <section className="border-y border-border bg-mint-soft/40 py-16">
      <div className="container-premium text-center">
        <p className="eyebrow mb-3">Ποιότητα</p>
        <h2 className="font-display text-3xl text-charcoal md:text-4xl">
          Προϊόντα που εμπιστευόμαστε
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-warm-gray">
          Η ποιότητα δεν είναι διαπραγματεύσιμη. Επιλέγουμε brands που σέβονται το νύχι,
          το δέρμα και το αποτέλεσμα — μέρος της φιλοσοφίας του salon.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-5">
          {brands.map((b) => (
            <span
              key={b}
              className="rounded-full border border-border bg-white px-5 py-3 text-sm font-medium tracking-wide text-charcoal"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

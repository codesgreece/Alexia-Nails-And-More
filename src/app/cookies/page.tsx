import Link from "next/link";

export const metadata = {
  title: "Πολιτική Cookies | Alexia Nails & More",
};

export default function CookiesPage() {
  return (
    <main className="container-premium section-pad max-w-3xl">
      <Link href="/" className="text-sm text-pink">← Αρχική</Link>
      <h1 className="font-display mt-4 text-4xl text-charcoal">Πολιτική Cookies</h1>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-charcoal/85">
        <p>
          Χρησιμοποιούμε απαραίτητα cookies για τη λειτουργία του site (π.χ. προτίμηση συγκατάθεσης,
          ασφαλή σύνδεση admin).
        </p>
        <p>
          Μη απαραίτητα cookies / tracking scripts δεν φορτώνονται πριν από τη συγκατάθεσή σας
          μέσω του banner cookies.
        </p>
        <p>
          Μπορείτε να αλλάξετε την επιλογή σας διαγράφοντας τα δεδομένα του browser για το site.
        </p>
      </div>
    </main>
  );
}

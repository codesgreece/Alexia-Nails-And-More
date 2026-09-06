import Link from "next/link";

export const metadata = {
  title: "Πολιτική Απορρήτου | Alexia Nails & More",
};

export default function PrivacyPage() {
  return (
    <main className="container-premium section-pad max-w-3xl">
      <Link href="/" className="text-sm text-pink">← Αρχική</Link>
      <h1 className="font-display mt-4 text-4xl text-charcoal">Πολιτική Απορρήτου</h1>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-charcoal/85">
        <p>
          Το Alexia Nails & More σέβεται την ιδιωτικότητά σας. Συλλέγουμε μόνο τα απαραίτητα
          στοιχεία για τη διαχείριση ραντεβού (όνομα, τηλέφωνο, email, σημειώσεις).
        </p>
        <p>
          Τα δεδομένα χρησιμοποιούνται αποκλειστικά για επιβεβαίωση, υπενθύμιση και εξυπηρέτηση
          πελατών. Δεν πωλούνται σε τρίτους.
        </p>
        <p>
          Για αιτήματα πρόσβασης, διόρθωσης ή διαγραφής επικοινωνήστε στο{" "}
          <a className="text-pink" href="mailto:alexiakelesidou@gmail.com">alexiakelesidou@gmail.com</a>.
        </p>
        <p>Νομική βάση: εκτέλεση σύμβασης υπηρεσιών και έννομο συμφέρον λειτουργίας του salon.</p>
      </div>
    </main>
  );
}

import Link from "next/link";

export const metadata = {
  title: "Όροι Χρήσης | Alexia Nails & More",
};

export default function TermsPage() {
  return (
    <main className="container-premium section-pad max-w-3xl">
      <Link href="/" className="text-sm text-pink">← Αρχική</Link>
      <h1 className="font-display mt-4 text-4xl text-charcoal">Όροι Χρήσης</h1>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-charcoal/85">
        <p>
          Η χρήση του website και του συστήματος κρατήσεων του Alexia Nails & More προϋποθέτει
          αποδοχή των παρόντων όρων.
        </p>
        <p>
          Οι online κρατήσεις θεωρούνται αιτήματα ραντεβού. Το studio μπορεί να επικοινωνήσει
          για επιβεβαίωση ή αλλαγή ώρας όταν απαιτείται.
        </p>
        <p>
          Σε περίπτωση καθυστέρησης ή αδυναμίας προσέλευσης, παρακαλούμε ενημερώστε έγκαιρα στο
          23730 26609.
        </p>
        <p>
          Το περιεχόμενο του site προστατεύεται. Απαγορεύεται η αναπαραγωγή χωρίς άδεια.
        </p>
      </div>
    </main>
  );
}

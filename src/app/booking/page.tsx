import { Suspense } from "react";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { getBusinessSettings } from "@/lib/data";

export const metadata = {
  title: "Κλείσε Ραντεβού | Alexia Nails & More",
  description: "Online booking για μανικιούρ, πεντικιούρ, brows και lash lift στα Νέα Μουδανιά.",
};

export default async function BookingPage() {
  const settings = await getBusinessSettings();

  return (
    <main className="min-h-screen marble-bg px-4 py-10 md:py-16">
      <Suspense fallback={<div className="text-center text-warm-gray">Φόρτωση…</div>}>
        <BookingWizard logoUrl={settings.logoUrl} />
      </Suspense>
    </main>
  );
}

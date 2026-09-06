import Link from "next/link";
import { DAY_NAMES_GR, formatPhoneLink } from "@/lib/utils";
import { MapPin, Phone, Mail } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";

type Hour = {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export function ContactSection({
  phone,
  email,
  addressLine1,
  addressLine2,
  instagramUrl,
  instagramHandle,
  mapEmbedUrl,
  mapsDirectionsUrl,
  hours,
  whatsappNumber,
}: {
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  instagramUrl: string;
  instagramHandle: string;
  mapEmbedUrl: string;
  mapsDirectionsUrl: string;
  hours: Hour[];
  whatsappNumber: string | null;
}) {
  return (
    <section id="contact" className="section-pad bg-white">
      <div className="container-premium grid gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow mb-3">Επικοινωνία</p>
          <h2 className="font-display text-4xl text-charcoal md:text-5xl">
            Ελάτε να γνωριστούμε
          </h2>
          <p className="mt-4 text-warm-gray">
            Στη Χρυσοστόμου Σμύρνης 22, στα Νέα Μουδανιά — ένας χώρος αφιερωμένος σε εσάς.
          </p>

          <ul className="mt-8 space-y-4 text-charcoal">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-pink" />
              <span>
                {addressLine1}
                <br />
                {addressLine2}
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-pink" />
              <a href={formatPhoneLink(phone)} className="hover:text-pink">
                {phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-pink" />
              <a href={`mailto:${email}`} className="hover:text-pink">
                {email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <InstagramIcon className="h-5 w-5 text-pink" />
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-pink">
                {instagramHandle}
              </a>
            </li>
          </ul>

          <div className="mt-8">
            <h3 className="mb-3 text-sm tracking-[0.16em] text-warm-gray uppercase">Ωράριο</h3>
            <ul className="space-y-1.5 text-sm">
              {hours.map((h) => (
                <li key={h.dayOfWeek} className="flex justify-between gap-6 border-b border-border/70 py-1.5">
                  <span>{DAY_NAMES_GR[h.dayOfWeek]}</span>
                  <span className="text-warm-gray">
                    {h.isClosed ? "Κλειστά" : `${h.openTime} - ${h.closeTime}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={formatPhoneLink(phone)} className="btn-primary text-sm">
              Κλήση
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm"
            >
              Instagram
            </a>
            <Link href="/booking" className="btn-secondary text-sm">
              Book Appointment
            </Link>
            <a
              href={mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm"
            >
              Οδηγίες
            </a>
            {whatsappNumber ? (
              <a
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm"
              >
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.8rem] border border-border shadow-[0_20px_50px_rgba(48,48,48,0.08)]">
          <iframe
            title="Χάρτης Alexia Nails & More"
            src={mapEmbedUrl}
            className="h-full min-h-[420px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}

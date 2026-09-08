import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { DAY_NAMES_GR, formatPhoneLink } from "@/lib/utils";

type Hour = {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export function SiteFooter({
  logoUrl,
  businessName,
  phone,
  email,
  addressLine1,
  addressLine2,
  instagramUrl,
  instagramHandle,
  facebookUrl,
  hours,
}: {
  logoUrl: string;
  businessName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  instagramUrl: string;
  instagramHandle: string;
  facebookUrl: string | null;
  hours: Hour[];
}) {
  return (
    <footer className="border-t border-border bg-charcoal text-white">
      <div className="container-premium grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandLogo
            src={logoUrl}
            alt={businessName}
            className="mb-4 h-11 w-auto max-w-[180px] brightness-0 invert"
          />
          <p className="max-w-xs text-sm leading-relaxed text-white/70">
            Premium nail & beauty studio στα Νέα Μουδανιά. Εμπειρία, φροντίδα και
            αισθητική στη λεπτομέρεια.
          </p>
          <Link href="/booking" className="btn-primary mt-6 text-sm">
            Κλείσε Ραντεβού
          </Link>
        </div>

        <div>
          <h3 className="mb-4 text-sm tracking-[0.18em] uppercase text-mint">Πλοήγηση</h3>
          <ul className="space-y-2 text-sm text-white/75">
            {[
              ["/#about", "About"],
              ["/#services", "Υπηρεσίες"],
              ["/#gallery", "Gallery"],
              ["/#team", "Ομάδα"],
              ["/#contact", "Επικοινωνία"],
              ["/booking", "Ραντεβού"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-pink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm tracking-[0.18em] uppercase text-mint">Επικοινωνία</h3>
          <ul className="space-y-2 text-sm text-white/75">
            <li>
              <a href={formatPhoneLink(phone)} className="hover:text-pink">
                {phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${email}`} className="hover:text-pink">
                {email}
              </a>
            </li>
            <li>
              {addressLine1}
              <br />
              {addressLine2}
            </li>
            <li>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-pink">
                Instagram {instagramHandle}
              </a>
            </li>
            {facebookUrl ? (
              <li>
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-pink">
                  Facebook
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm tracking-[0.18em] uppercase text-mint">Ωράριο</h3>
          <ul className="space-y-1.5 text-sm text-white/75">
            {hours
              .filter((h) => h.dayOfWeek !== 0)
              .concat(hours.filter((h) => h.dayOfWeek === 0))
              .map((h) => (
                <li key={h.dayOfWeek} className="flex justify-between gap-4">
                  <span>{DAY_NAMES_GR[h.dayOfWeek]}</span>
                  <span>
                    {h.isClosed ? "Κλειστά" : `${h.openTime} - ${h.closeTime}`}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-premium flex flex-col gap-3 py-5 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
            <p>
              Σχεδιασμός &amp; ανάπτυξη από Χαράλαμπο Χριστόπουλο ·{" "}
              <a href="tel:+306936732844" className="hover:text-white">
                693 673 2844
              </a>
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Απόρρητο</Link>
            <Link href="/terms" className="hover:text-white">Όροι</Link>
            <Link href="/cookies" className="hover:text-white">Cookies</Link>
            <Link href="/admin/login" className="hover:text-white">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

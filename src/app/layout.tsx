import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { CookieConsent } from "@/components/public/CookieConsent";
import { LoadingScreen } from "@/components/public/LoadingScreen";
import { getBusinessSettings } from "@/lib/data";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "greek"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin", "greek"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBusinessSettings();
  return {
    title: settings.metaTitle,
    description: settings.metaDescription,
    metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
    openGraph: {
      title: settings.metaTitle,
      description: settings.metaDescription,
      locale: "el_GR",
      type: "website",
      images: [{ url: settings.heroImageUrl }],
      siteName: settings.businessName,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.metaTitle,
      description: settings.metaDescription,
      images: [settings.heroImageUrl],
    },
    alternates: { canonical: "/" },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getBusinessSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["BeautySalon", "NailSalon", "LocalBusiness"],
    name: settings.businessName,
    image: settings.logoUrl,
    telephone: settings.phone,
    email: settings.email,
    url: process.env.NEXTAUTH_URL || "http://localhost:3000",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.addressLine1,
      addressLocality: settings.city,
      addressRegion: settings.region,
      postalCode: settings.postalCode,
      addressCountry: settings.country,
    },
    sameAs: [settings.instagramUrl, settings.facebookUrl].filter(Boolean),
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "09:00", closes: "17:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Tuesday", opens: "09:00", closes: "20:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Wednesday", opens: "09:00", closes: "17:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday", opens: "09:00", closes: "20:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "09:00", closes: "20:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "17:00" },
    ],
  };

  return (
    <html lang="el" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LoadingScreen logoUrl={settings.logoUrl} businessName={settings.businessName} />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}

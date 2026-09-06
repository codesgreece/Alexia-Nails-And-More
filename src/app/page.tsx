import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { HeroSection } from "@/components/public/HeroSection";
import { BrandIntro } from "@/components/public/BrandIntro";
import { ServicesSection } from "@/components/public/ServicesSection";
import { AboutAlexia } from "@/components/public/AboutAlexia";
import { TeamSection } from "@/components/public/TeamSection";
import { WhySection } from "@/components/public/WhySection";
import { ProductsSection } from "@/components/public/ProductsSection";
import { GallerySection } from "@/components/public/GallerySection";
import { ReviewsSection } from "@/components/public/ReviewsSection";
import { ContactSection } from "@/components/public/ContactSection";
import {
  getActiveServicesGrouped,
  getActiveStaff,
  getBusinessSettings,
  getGalleryImages,
  getOpeningHours,
  getPublishedReviews,
} from "@/lib/data";

export default async function HomePage() {
  const [settings, categories, staff, gallery, reviews, hours] = await Promise.all([
    getBusinessSettings(),
    getActiveServicesGrouped(),
    getActiveStaff(),
    getGalleryImages(),
    getPublishedReviews(),
    getOpeningHours(),
  ]);

  return (
    <>
      <SiteHeader
        logoUrl={settings.logoUrl}
        businessName={settings.businessName}
        phone={settings.phone}
        instagramUrl={settings.instagramUrl}
      />
      <main className="pb-24 md:pb-0">
        <HeroSection
          logoUrl={settings.logoUrl}
          businessName={settings.businessName}
          eyebrow={settings.heroEyebrow}
          title={settings.heroTitle}
          subtitle={settings.heroSubtitle}
          imageUrl={settings.heroImageUrl}
        />
        <BrandIntro
          statement={settings.brandStatement}
          imageUrl="/images/about-salon.jpg"
        />
        <ServicesSection categories={categories} />
        <AboutAlexia
          title={settings.aboutTitle}
          text={settings.aboutText}
          imageUrl="/images/gallery-manicure.jpg"
        />
        <TeamSection staff={staff} />
        <WhySection />
        <ProductsSection />
        <GallerySection images={gallery} />
        <ReviewsSection reviews={reviews} />
        <ContactSection
          phone={settings.phone}
          email={settings.email}
          addressLine1={settings.addressLine1}
          addressLine2={settings.addressLine2}
          instagramUrl={settings.instagramUrl}
          instagramHandle={settings.instagramHandle}
          mapEmbedUrl={settings.mapEmbedUrl}
          mapsDirectionsUrl={settings.mapsDirectionsUrl}
          hours={hours}
          whatsappNumber={settings.whatsappNumber}
        />
      </main>
      <SiteFooter
        logoUrl={settings.logoUrl}
        businessName={settings.businessName}
        phone={settings.phone}
        email={settings.email}
        addressLine1={settings.addressLine1}
        addressLine2={settings.addressLine2}
        instagramUrl={settings.instagramUrl}
        instagramHandle={settings.instagramHandle}
        facebookUrl={settings.facebookUrl}
        hours={hours}
      />
      <FloatingActions phone={settings.phone} instagramUrl={settings.instagramUrl} />
      <MobileBottomNav />
    </>
  );
}

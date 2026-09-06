import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ABOUT_TEXT = `Με πάνω από 20 χρόνια εμπειρίας στο μανικιούρ, το πεντικιούρ και την αισθητική, η Αλεξία Κελεσίδου έχει αφιερώσει τη ζωή της στο να κάνει κάθε γυναίκα να νιώθει ξεχωριστή.

Απόφοιτη Δημόσιου ΙΕΚ Αισθητικής με πιστοποίηση ΕΟΠΠΕΠ, συνεχίζει να εξελίσσεται μέσα από σεμινάρια σε θεραπείες νυχιών, θεραπευτικό πεντικιούρ, Lash & Brow Lift, καθώς και γνώσεις ποδολογίας.

Στο Alexia Nails & More, η φροντίδα δεν είναι ρουτίνα — είναι προσωπική δέσμευση στην ποιότητα, τον επαγγελματισμό και τη λεπτομέρεια.`;

const BRAND_STATEMENT = `20+ χρόνια εμπειρίας.
Μία φιλοσοφία:
η φροντίδα φαίνεται στη λεπτομέρεια.`;

async function main() {
  await prisma.notification.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.staffService.deleteMany();
  await prisma.staffBreak.deleteMany();
  await prisma.staffVacation.deleteMany();
  await prisma.staffSchedule.deleteMany();
  await prisma.blockedDate.deleteMany();
  await prisma.specialHour.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.galleryImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.openingHour.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.businessSettings.deleteMany();

  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "AlexiaAdmin2026!",
    12
  );

  await prisma.adminUser.create({
    data: {
      email: process.env.ADMIN_EMAIL || "admin@alexianails.gr",
      name: "Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.businessSettings.create({
    data: {
      id: "main",
      aboutText: ABOUT_TEXT,
      brandStatement: BRAND_STATEMENT,
    },
  });

  const hours = [
    { dayOfWeek: 0, isClosed: true, openTime: null as string | null, closeTime: null as string | null },
    { dayOfWeek: 1, isClosed: false, openTime: "09:00", closeTime: "17:00" },
    { dayOfWeek: 2, isClosed: false, openTime: "09:00", closeTime: "20:00" },
    { dayOfWeek: 3, isClosed: false, openTime: "09:00", closeTime: "17:00" },
    { dayOfWeek: 4, isClosed: false, openTime: "09:00", closeTime: "20:00" },
    { dayOfWeek: 5, isClosed: false, openTime: "09:00", closeTime: "20:00" },
    { dayOfWeek: 6, isClosed: false, openTime: "09:00", closeTime: "17:00" },
  ];
  for (const h of hours) {
    await prisma.openingHour.create({ data: h });
  }

  const alexia = await prisma.staff.create({
    data: {
      name: "Αλεξία",
      slug: "alexia",
      bio: "Ιδιοκτήτρια · 20+ χρόνια εμπειρίας · Πιστοποίηση ΕΟΠΠΕΠ",
      specialties: "Νύχια, Θεραπευτικό Πεντικιούρ, Lash & Brow Lift, Ποδολογία",
      color: "#D91B73",
      status: "ACTIVE",
      displayOrder: 1,
    },
  });
  const elena = await prisma.staff.create({
    data: {
      name: "Έλενα",
      slug: "elena",
      bio: null,
      specialties: "Μανικιούρ, Πεντικιούρ, Nail Art",
      color: "#91C8C0",
      status: "ACTIVE",
      displayOrder: 2,
    },
  });
  const vaso = await prisma.staff.create({
    data: {
      name: "Βάσω",
      slug: "vaso",
      bio: null,
      specialties: "Μανικιούρ, Πεντικιούρ, Brows",
      color: "#1E3A8A",
      status: "ACTIVE",
      displayOrder: 3,
    },
  });

  const staffList = [alexia, elena, vaso];
  for (const s of staffList) {
    for (let d = 0; d <= 6; d++) {
      const closed = d === 0;
      const longDay = d === 2 || d === 4 || d === 5;
      await prisma.staffSchedule.create({
        data: {
          staffId: s.id,
          dayOfWeek: d,
          isOff: closed,
          startTime: closed ? null : "09:00",
          endTime: closed ? null : longDay ? "20:00" : "17:00",
        },
      });
    }
  }

  const manicure = await prisma.serviceCategory.create({
    data: {
      name: "Manicure",
      slug: "manicure",
      description: "Φροντίδα και αισθητική για τα χέρια σας",
      displayOrder: 1,
    },
  });
  const pedicure = await prisma.serviceCategory.create({
    data: {
      name: "Pedicure",
      slug: "pedicure",
      description: "Περιποίηση και θεραπεία για τα πόδια σας",
      displayOrder: 2,
    },
  });
  const brows = await prisma.serviceCategory.create({
    data: {
      name: "Brows",
      slug: "brows",
      description: "Σχήμα και φροντίδα φρυδιών",
      displayOrder: 3,
    },
  });
  const lashes = await prisma.serviceCategory.create({
    data: {
      name: "Lashes",
      slug: "lashes",
      description: "Αναδεικνύστε το βλέμμα σας",
      displayOrder: 4,
    },
  });

  const services = [
    { categoryId: manicure.id, name: "Μανικιούρ (απλό βερνίκι)", slug: "manicure-simple", description: "Κλασική περιποίηση νυχιών με απλό βερνίκι.", durationMin: 45, icon: "nail", order: 1 },
    { categoryId: manicure.id, name: "Μανικιούρ Special (απλό)", slug: "manicure-special", description: "Αναβαθμισμένη περιποίηση με απλό βερνίκι.", durationMin: 50, icon: "sparkle", order: 2 },
    { categoryId: manicure.id, name: "Μανικιούρ Ενισχυμένο Ημιμόνιμο", slug: "manicure-gel", description: "Ημιμόνιμο βερνίκι με ενισχυμένη αντοχή.", durationMin: 60, icon: "gel", order: 3 },
    { categoryId: manicure.id, name: "Ενίσχυση Φυσικού Νυχιού", slug: "natural-nail-strengthening", description: "Ενίσχυση και προστασία του φυσικού νυχιού.", durationMin: 60, icon: "shield", order: 4 },
    { categoryId: manicure.id, name: "Gelly Tips (με χρώμα)", slug: "gelly-tips", description: "Gelly tips με χρώμα για φυσικό αποτέλεσμα.", durationMin: 90, icon: "tips", order: 5 },
    { categoryId: manicure.id, name: "Επιμήκυνση (gel, acrylic, acrygel)", slug: "extensions", description: "Επιμήκυνση με gel, acrylic ή acrygel.", durationMin: 120, icon: "extend", order: 6 },
    { categoryId: manicure.id, name: "Συντήρηση (gel, acrygel)", slug: "maintenance", description: "Συντήρηση τεχνητών νυχιών gel ή acrygel.", durationMin: 75, icon: "refresh", order: 7 },
    { categoryId: manicure.id, name: "Nail Art (και σχέδια)", slug: "nail-art", description: "Καλλιτεχνικά σχέδια και λεπτομέρειες στα νύχια.", durationMin: 30, icon: "art", order: 8 },
    { categoryId: manicure.id, name: "Γαλλικό – Όμπρε", slug: "french-ombre", description: "Κλασικό γαλλικό ή όμπρε φινίρισμα.", durationMin: 20, icon: "french", order: 9 },
    { categoryId: manicure.id, name: "Αφαίρεση Ημιμόνιμου", slug: "gel-removal", description: "Ασφαλής αφαίρεση ημιμόνιμου βερνικιού.", durationMin: 30, icon: "remove", order: 10 },
    { categoryId: manicure.id, name: "Αφαίρεση Τεχνητών", slug: "extension-removal", description: "Προσεκτική αφαίρεση τεχνητών νυχιών.", durationMin: 45, icon: "remove", order: 11 },
    { categoryId: pedicure.id, name: "Πεντικιούρ (χωρίς βαφή)", slug: "pedicure-no-polish", description: "Πλήρης περιποίηση ποδιών χωρίς βαφή.", durationMin: 45, icon: "foot", order: 1 },
    { categoryId: pedicure.id, name: "Πεντικιούρ (με απλό μανό)", slug: "pedicure-simple", description: "Πεντικιούρ με απλό βερνίκι.", durationMin: 55, icon: "foot", order: 2 },
    { categoryId: pedicure.id, name: "Πεντικιούρ (ημιμόνιμη βαφή + full περιποίηση)", slug: "pedicure-gel", description: "Πλήρης περιποίηση με ημιμόνιμη βαφή.", durationMin: 70, icon: "foot", order: 3 },
    { categoryId: pedicure.id, name: "Πεντικιούρ Θεραπευτικό", slug: "pedicure-therapeutic", description: "Θεραπευτική φροντίδα με γνώσεις ποδολογίας.", durationMin: 60, icon: "heal", order: 4 },
    { categoryId: brows.id, name: "Brow Lift", slug: "brow-lift", description: "Αναδιαμόρφωση και ανύψωση φρυδιών.", durationMin: 45, icon: "brow", order: 1 },
    { categoryId: brows.id, name: "Καθαρισμός φρυδιών", slug: "brow-clean", description: "Καθαρισμός και περιποίηση φρυδιών.", durationMin: 20, icon: "brow", order: 2 },
    { categoryId: brows.id, name: "Σχηματισμός φρυδιών", slug: "brow-shape", description: "Σχήμα που αναδεικνύει το βλέμμα σας.", durationMin: 25, icon: "brow", order: 3 },
    { categoryId: brows.id, name: "Σχηματισμός φρυδιών με βαφή", slug: "brow-shape-tint", description: "Σχήμα και βαφή για πιο έντονο αποτέλεσμα.", durationMin: 35, icon: "brow", order: 4 },
    { categoryId: lashes.id, name: "Lash Lift", slug: "lash-lift", description: "Φυσική ανύψωση και καμπύλη στις βλεφαρίδες.", durationMin: 50, icon: "lash", order: 1 },
  ];

  for (const svc of services) {
    const created = await prisma.service.create({
      data: {
        name: svc.name,
        slug: svc.slug,
        description: svc.description,
        durationMin: svc.durationMin,
        icon: svc.icon,
        displayOrder: svc.order,
        status: "ACTIVE",
        categoryId: svc.categoryId,
      },
    });
    for (const s of staffList) {
      await prisma.staffService.create({
        data: { staffId: s.id, serviceId: created.id },
      });
    }
  }

  const gallery = [
    { title: "Manicure", alt: "Premium manicure", imageUrl: "/images/gallery-manicure.jpg", category: "Manicure", featured: true, displayOrder: 1 },
    { title: "Nail Art", alt: "French ombre nail art", imageUrl: "/images/gallery-nailart.jpg", category: "Nail Art", featured: true, displayOrder: 2 },
    { title: "Pedicure", alt: "Luxury pedicure", imageUrl: "/images/gallery-pedicure.jpg", category: "Pedicure", featured: true, displayOrder: 3 },
    { title: "Salon", alt: "Alexia Nails & More salon", imageUrl: "/images/about-salon.jpg", category: "Salon", featured: true, displayOrder: 4 },
    { title: "Beauty", alt: "Beauty details", imageUrl: "/images/hero-nails.jpg", category: "Beauty", featured: false, displayOrder: 5 },
    { title: "Nails", alt: "Nail details", imageUrl: "/images/gallery-manicure.jpg", category: "Nails", featured: false, displayOrder: 6 },
  ];

  for (const g of gallery) {
    await prisma.galleryImage.create({ data: g });
  }

  console.log("Seed completed successfully.");
  console.log(`Admin: ${process.env.ADMIN_EMAIL || "admin@alexianails.gr"}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

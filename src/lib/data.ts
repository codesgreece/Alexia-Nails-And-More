import { prisma } from "./prisma";

export async function getBusinessSettings() {
  const settings = await prisma.businessSettings.findUnique({
    where: { id: "main" },
  });
  if (settings) return settings;
  return prisma.businessSettings.create({ data: { id: "main" } });
}

export async function getOpeningHours() {
  return prisma.openingHour.findMany({ orderBy: { dayOfWeek: "asc" } });
}

export async function getActiveServicesGrouped() {
  const categories = await prisma.serviceCategory.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      services: {
        where: { status: "ACTIVE" },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          durationMin: true,
          icon: true,
          imageUrl: true,
          displayOrder: true,
          categoryId: true,
          status: true,
        },
      },
    },
  });
  return categories.filter((c) => c.services.length > 0);
}

export async function getActiveStaff() {
  return prisma.staff.findMany({
    where: { status: "ACTIVE" },
    orderBy: { displayOrder: "asc" },
  });
}

export async function getGalleryImages(featuredOnly = false) {
  return prisma.galleryImage.findMany({
    where: featuredOnly ? { featured: true } : undefined,
    orderBy: { displayOrder: "asc" },
  });
}

export async function getPublishedReviews() {
  return prisma.review.findMany({
    where: { published: true },
    orderBy: [{ featured: "desc" }, { displayOrder: "asc" }],
  });
}

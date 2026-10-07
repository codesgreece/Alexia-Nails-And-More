/**
 * Apply schema to Turso and copy all rows from local prisma/dev.db.
 * Requires TURSO_DATABASE_URL + TURSO_AUTH_TOKEN.
 */
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!url || !authToken) {
  console.error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required");
  process.exit(1);
}

const pushUrl = `${url}${url.includes("?") ? "&" : "?"}authToken=${encodeURIComponent(authToken)}`;

console.log("▶ prisma db push → Turso");
execSync("npx prisma db push --skip-generate --accept-data-loss", {
  stdio: "inherit",
  env: { ...process.env, DATABASE_URL: pushUrl },
});

const local = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL || "file:./dev.db" } },
});

const remote = new PrismaClient({
  adapter: new PrismaLibSQL(createClient({ url, authToken })),
});

async function main() {
  const adminCount = await remote.adminUser.count();
  if (adminCount > 0) {
    console.log("Turso already seeded — skipping data copy");
    return;
  }

  console.log("▶ Copying local SQLite rows to Turso");

  const [
    admins,
    settings,
    hours,
    staff,
    categories,
    services,
    staffServices,
    schedules,
    gallery,
    reviews,
  ] = await Promise.all([
    local.adminUser.findMany(),
    local.businessSettings.findMany(),
    local.openingHour.findMany(),
    local.staff.findMany(),
    local.serviceCategory.findMany(),
    local.service.findMany(),
    local.staffService.findMany(),
    local.staffSchedule.findMany(),
    local.galleryImage.findMany(),
    local.review.findMany(),
  ]);

  if (admins.length) await remote.adminUser.createMany({ data: admins });
  if (settings.length) await remote.businessSettings.createMany({ data: settings });
  if (hours.length) await remote.openingHour.createMany({ data: hours });
  if (staff.length) await remote.staff.createMany({ data: staff });
  if (categories.length) await remote.serviceCategory.createMany({ data: categories });
  if (services.length) await remote.service.createMany({ data: services });
  if (staffServices.length) await remote.staffService.createMany({ data: staffServices });
  if (schedules.length) await remote.staffSchedule.createMany({ data: schedules });
  if (gallery.length) await remote.galleryImage.createMany({ data: gallery });
  if (reviews.length) await remote.review.createMany({ data: reviews });

  console.log("▶ Turso seed copy complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await Promise.all([local.$disconnect(), remote.$disconnect()]);
  });

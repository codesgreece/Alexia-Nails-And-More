import { PrismaClient } from "@prisma/client";
import { copyFileSync, existsSync } from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  alexiaDbReady?: boolean;
};

function resolveDatabaseUrl() {
  const configured = process.env.DATABASE_URL || "file:./dev.db";
  const onVercel = Boolean(process.env.VERCEL);

  if (!onVercel) return configured;

  // Vercel serverless filesystem is read-only except /tmp.
  const tmpDb = "/tmp/alexia.db";
  const seeded = path.join(process.cwd(), "prisma", "prod.db");

  if (!globalForPrisma.alexiaDbReady) {
    if (existsSync(seeded) && !existsSync(tmpDb)) {
      copyFileSync(seeded, tmpDb);
    }
    globalForPrisma.alexiaDbReady = true;
  }

  return existsSync(tmpDb) ? `file:${tmpDb}` : configured;
}

function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: { url: resolveDatabaseUrl() },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

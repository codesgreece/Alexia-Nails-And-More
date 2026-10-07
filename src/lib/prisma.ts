import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  alexiaBlobReady?: boolean;
  alexiaBlobCheckedAt?: number;
};

const TMP_DB = "/tmp/alexia.db";
const BLOB_PATHNAME = "alexia-runtime.db";
const BLOB_REFRESH_MS = 2500;
const MUTATING = new Set([
  "create",
  "update",
  "upsert",
  "delete",
  "createMany",
  "updateMany",
  "deleteMany",
]);

function seededDbPath() {
  const prod = path.join(process.cwd(), "prisma", "prod.db");
  const dev = path.join(process.cwd(), "prisma", "dev.db");
  if (existsSync(prod)) return prod;
  if (existsSync(dev)) return dev;
  return null;
}

function seedLocalTmp() {
  const source = seededDbPath();
  if (source) copyFileSync(source, TMP_DB);
}

async function downloadBlobDb(): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;
  try {
    const { list } = await import("@vercel/blob");
    const result = await list({ prefix: BLOB_PATHNAME, limit: 20 });
    const blob = result.blobs.find((b) => b.pathname === BLOB_PATHNAME);
    if (!blob) return false;
    const res = await fetch(blob.url, { cache: "no-store" });
    if (!res.ok) return false;
    writeFileSync(TMP_DB, Buffer.from(await res.arrayBuffer()));
    globalForPrisma.alexiaBlobCheckedAt = Date.now();
    return true;
  } catch (error) {
    console.error("[prisma] blob download failed", error);
    return false;
  }
}

async function uploadBlobDb() {
  if (!process.env.BLOB_READ_WRITE_TOKEN || !existsSync(TMP_DB)) return;
  try {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATHNAME, readFileSync(TMP_DB), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      contentType: "application/x-sqlite3",
    });
    globalForPrisma.alexiaBlobCheckedAt = Date.now();
  } catch (error) {
    console.error("[prisma] blob upload failed", error);
  }
}

async function ensureBlobDb(force = false) {
  if (!process.env.VERCEL || !process.env.BLOB_READ_WRITE_TOKEN) {
    if (process.env.VERCEL && !existsSync(TMP_DB)) seedLocalTmp();
    return;
  }

  const stale =
    force ||
    !globalForPrisma.alexiaBlobCheckedAt ||
    Date.now() - globalForPrisma.alexiaBlobCheckedAt > BLOB_REFRESH_MS;

  if (!stale && existsSync(TMP_DB)) return;

  const restored = await downloadBlobDb();
  if (!restored && !existsSync(TMP_DB)) {
    seedLocalTmp();
    if (existsSync(TMP_DB)) await uploadBlobDb();
  }
  globalForPrisma.alexiaBlobReady = true;
}

function attachBlobSync(client: PrismaClient) {
  if (!process.env.VERCEL || !process.env.BLOB_READ_WRITE_TOKEN) return client;

  client.$use(async (params, next) => {
    const mutating = MUTATING.has(params.action);
    await ensureBlobDb(mutating);
    const result = await next(params);
    if (mutating) await uploadBlobDb();
    return result;
  });

  return client;
}

async function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  const tursoToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (tursoUrl) {
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  if (process.env.VERCEL) {
    await ensureBlobDb(true);
  }

  const configured = process.env.DATABASE_URL || "file:./dev.db";
  const url =
    process.env.VERCEL && existsSync(TMP_DB) ? `file:${TMP_DB}` : configured;

  const client = new PrismaClient({
    datasources: {
      db: { url },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  return attachBlobSync(client);
}

const prisma = globalForPrisma.prisma || (await createPrismaClient());

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

export { prisma };

export function hasDurableDatabase() {
  return Boolean(
    process.env.TURSO_DATABASE_URL?.trim() ||
      (process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN) ||
      !process.env.VERCEL
  );
}

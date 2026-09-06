#!/usr/bin/env bash
set -euo pipefail

export DATABASE_URL="${DATABASE_URL:-file:./dev.db}"
export AUTH_SECRET="${AUTH_SECRET:-${NEXTAUTH_SECRET:-alexia-nails-and-more/HTMvgwxUGnGiqT4rgFTe//aMiWhADSaOZ76OSKvdam0B4LeNmff1L2p4oQXJlP4d}}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost:3000}"
export ADMIN_EMAIL="${ADMIN_EMAIL:-admin@alexianails.gr}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-AlexiaAdmin2026!}"

echo "▶ Prisma generate"
npx prisma generate

echo "▶ Prisma db push ($DATABASE_URL)"
npx prisma db push --skip-generate

echo "▶ Seed database"
npx tsx prisma/seed.ts

echo "▶ Copy seeded DB for Vercel runtime"
cp prisma/dev.db prisma/prod.db

echo "▶ Prebuild complete"

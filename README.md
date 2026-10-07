# Alexia Nails & More

Premium website, online booking system, and admin panel for Alexia Nails & More (Νέα Μουδανιά).

## Stack

- Next.js 16 (App Router) + TypeScript
- Prisma + SQLite
- NextAuth (credentials) for admin
- Tailwind CSS + Framer Motion

## Setup

```bash
npm install
cp .env.example .env
npm run db:setup
npm run dev
```

## Default admin

- URL: `/admin/login`
- Email: `admin@alexianails.gr`
- Password: from `ADMIN_PASSWORD` in `.env` (seed default: `AlexiaAdmin2026!`)

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm start` — production
- `npm run db:setup` — generate, push schema, seed

## Notes

- Service prices are never shown on the public site.
- Lash extension packages are intentionally excluded.
- Reviews are admin-managed only (no fake reviews seeded).
- Email notifications are queued; delivery is skipped until SMTP is configured.

## Vercel persistence (important)

SQLite on the Vercel filesystem is ephemeral. Without durable storage, admin
edits appear to save then disappear on the next cold start.

Pick one:

1. **Vercel Blob (easiest)** — Project → Storage → Blob → Create → Connect → Redeploy  
   Uses `BLOB_READ_WRITE_TOKEN` automatically.
2. **Turso** — set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`, then Redeploy  
   (`npm run db:seed-turso` copies local seed data).

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

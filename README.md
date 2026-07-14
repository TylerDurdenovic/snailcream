# 🐌 SnailCream

Small e-commerce site for premium snail mucin cream, made in Germany.
**€15 for a set of 5 boxes × 10g.**

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Prisma 6 + SQLite**.

## Features

- Landing page + product page with images and pricing
- Login / register (email + username, bcrypt-hashed passwords, JWT session cookie)
- Checkout: quantity, shipping address, payment method (gift card / SEPA bank transfer / PayPal)
- Customer account: list of all orders with invoice number, date, amount, payment method, status and tracking number
- Printable invoice page per order
- Admin panel (`/admin`): stats, all orders, all customers
  - Edit any order/invoice: date, invoice number, amount, quantity, payment method & reference, status, carrier + tracking number, shipping address, notes
  - Create invoices manually for any customer, delete orders

## Getting started

```bash
npm install
cp .env.example .env   # then edit values (see below)
npm run setup          # creates the SQLite DB and seeds the admin (+ demo data)
npm run dev            # http://localhost:3000
```

## .env

| Variable         | Description                                                          |
| ---------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`   | SQLite file, keep `file:./dev.db`                                     |
| `AUTH_SECRET`    | Long random string used to sign session tokens — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_USERNAME` | Username for the seeded admin account                                 |
| `ADMIN_EMAIL`    | Email for the seeded admin account (used to log in)                   |
| `ADMIN_PASSWORD` | Password for the seeded admin account — change it!                    |
| `SEED_DEMO_DATA` | `"true"` to also seed a demo customer (`demo` / `demo1234`) with 2 sample invoices |

## Accounts after seeding

- **Admin:** the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env` → sees the **Admin** panel
- **Demo customer:** `demo` / `demo1234` (only if `SEED_DEMO_DATA="true"`)

## Scripts

- `npm run dev` — dev server
- `npm run build` / `npm start` — production build & serve
- `npm run db:push` — sync Prisma schema to the SQLite DB
- `npm run db:seed` — (re-)seed admin & demo data

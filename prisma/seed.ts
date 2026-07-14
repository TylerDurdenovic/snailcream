import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@snailcream.example";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me-please";

  if (adminPassword === "change-me-please") {
    console.warn(
      "⚠️  ADMIN_PASSWORD is still the placeholder value. Set a strong password in .env and re-run `npm run db:seed`."
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await db.user.upsert({
    where: { email: adminEmail },
    // also refresh the hash so changing ADMIN_PASSWORD in .env takes effect on re-seed
    update: { role: "ADMIN", passwordHash },
    create: {
      username: adminUsername,
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log(`Admin user ready: ${admin.username} <${admin.email}>`);

  if (process.env.SEED_DEMO_DATA === "true") {
    const demo = await db.user.upsert({
      where: { email: "demo@snailcream.example" },
      update: {},
      create: {
        username: "demo",
        email: "demo@snailcream.example",
        passwordHash: await bcrypt.hash("demo1234", 10),
        role: "CUSTOMER",
      },
    });

    // upsert by invoice number: idempotent, and never crashes if the
    // number is already taken by a real order
    await db.order.upsert({
      where: { invoiceNumber: "SC-2026-0001" },
      update: {},
      create: {
        invoiceNumber: "SC-2026-0001",
        userId: demo.id,
        quantity: 1,
        amountCents: 1500,
        paymentMethod: "GIFT_CARD",
        paymentReference: "GC-88412-ONLINE",
        status: "SHIPPED",
        trackingNumber: "00340434161094215",
        carrier: "DHL",
        shippingName: "Demo Customer",
        shippingAddress: "Musterstraße 12",
        shippingCity: "Berlin",
        shippingPostal: "10115",
        shippingCountry: "Germany",
        orderedAt: new Date("2026-07-01T10:30:00Z"),
      },
    });
    await db.order.upsert({
      where: { invoiceNumber: "SC-2026-0002" },
      update: {},
      create: {
        invoiceNumber: "SC-2026-0002",
        userId: demo.id,
        quantity: 2,
        amountCents: 3000,
        paymentMethod: "BANK_TRANSFER",
        status: "PENDING",
        shippingName: "Demo Customer",
        shippingAddress: "Musterstraße 12",
        shippingCity: "Berlin",
        shippingPostal: "10115",
        shippingCountry: "Germany",
        orderedAt: new Date("2026-07-10T15:00:00Z"),
      },
    });
    console.log("Demo customer (demo / demo1234) with sample invoices ready.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

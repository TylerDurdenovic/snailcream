import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PRODUCT, toDatetimeLocal } from "@/lib/shop";
import OrderEditor from "@/components/OrderEditor";

export const metadata: Metadata = { title: "New invoice | SnailCream Admin" };

export default async function AdminNewOrderPage() {
  await requireAdmin();

  const year = new Date().getFullYear();
  const count = await db.order.count();
  let invoiceNumber = "";
  for (let i = count + 1; ; i++) {
    const candidate = `SC-${year}-${String(i).padStart(4, "0")}`;
    const clash = await db.order.findUnique({
      where: { invoiceNumber: candidate },
    });
    if (!clash) {
      invoiceNumber = candidate;
      break;
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/admin"
        className="text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Back to admin
      </Link>
      <h1 className="mt-2 mb-8 text-3xl font-bold text-emerald-950">
        Create invoice manually
      </h1>

      <OrderEditor
        mode="create"
        defaults={{
          invoiceNumber,
          customer: "",
          productName: PRODUCT.name,
          quantity: 1,
          amountEur: (PRODUCT.unitPriceCents / 100).toFixed(2),
          paymentMethod: "GIFT_CARD",
          paymentReference: "",
          status: "PENDING",
          trackingNumber: "",
          carrier: "DHL",
          shippingName: "",
          shippingAddress: "",
          shippingCity: "",
          shippingPostal: "",
          shippingCountry: "Germany",
          notes: "",
          orderedAtLocal: toDatetimeLocal(new Date()),
        }}
      />
    </div>
  );
}

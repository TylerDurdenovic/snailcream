import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { toDatetimeLocal } from "@/lib/shop";
import OrderEditor from "@/components/OrderEditor";
import DeleteOrderButton from "@/components/DeleteOrderButton";

export const metadata: Metadata = { title: "Edit order | SnailCream Admin" };

export default async function AdminEditOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { created } = await searchParams;

  const order = await db.order.findUnique({
    where: { id },
    include: { user: { select: { username: true, email: true } } },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        href="/admin"
        className="text-sm font-medium text-emerald-700 hover:underline"
      >
        ← Back to admin
      </Link>

      {created && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✅ Invoice created.
        </p>
      )}

      <div className="mt-2 mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-950">
            Edit {order.invoiceNumber}
          </h1>
          <p className="mt-1 text-emerald-950/60">
            Customer: <strong>{order.user.username}</strong> ({order.user.email})
          </p>
        </div>
        <Link
          href={`/account/invoices/${order.id}`}
          className="rounded-full border border-emerald-900/15 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
        >
          View invoice
        </Link>
      </div>

      <OrderEditor
        mode="edit"
        defaults={{
          id: order.id,
          invoiceNumber: order.invoiceNumber,
          productName: order.productName,
          quantity: order.quantity,
          amountEur: (order.amountCents / 100).toFixed(2),
          paymentMethod: order.paymentMethod,
          paymentReference: order.paymentReference ?? "",
          status: order.status,
          trackingNumber: order.trackingNumber ?? "",
          carrier: order.carrier ?? "",
          shippingName: order.shippingName,
          shippingAddress: order.shippingAddress,
          shippingCity: order.shippingCity,
          shippingPostal: order.shippingPostal,
          shippingCountry: order.shippingCountry,
          notes: order.notes ?? "",
          orderedAtLocal: toDatetimeLocal(order.orderedAt),
        }}
      />

      <div className="mt-10 border-t border-emerald-900/10 pt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-rose-700/70">
          Danger zone
        </h2>
        <DeleteOrderButton id={order.id} />
      </div>
    </div>
  );
}

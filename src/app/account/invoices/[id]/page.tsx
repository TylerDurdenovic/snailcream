import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  formatDate,
  formatMoney,
  paymentLabel,
} from "@/lib/shop";
import StatusBadge from "@/components/StatusBadge";
import PrintButton from "@/components/PrintButton";

export const metadata: Metadata = { title: "Invoice | SnailCream" };

export default async function InvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const { placed } = await searchParams;
  const user = await requireUser(`/account/invoices/${id}`);

  const order = await db.order.findUnique({
    where: { id },
    include: { user: { select: { username: true, email: true } } },
  });
  if (!order) notFound();
  if (order.userId !== user.id && user.role !== "ADMIN") notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {placed && (
        <div className="no-print mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
          🎉 <strong>Order placed!</strong> Here is your invoice — we&apos;ll
          update the status and add tracking as soon as your payment is
          confirmed.
        </div>
      )}

      <div className="no-print mb-6 flex items-center justify-between">
        <Link
          href={user.role === "ADMIN" && order.userId !== user.id ? "/admin" : "/account"}
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Back to {user.role === "ADMIN" && order.userId !== user.id ? "admin" : "my invoices"}
        </Link>
        <div className="flex gap-3">
          {user.role === "ADMIN" && (
            <Link
              href={`/admin/orders/${order.id}`}
              className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
            >
              Edit in admin
            </Link>
          )}
          <PrintButton />
        </div>
      </div>

      <div className="print-card rounded-3xl border border-emerald-900/10 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/images/snail-logo.svg" alt="" className="h-12 w-12" />
            <div>
              <p className="text-xl font-bold text-emerald-950">
                Snail<span className="text-emerald-600">Cream</span>
              </p>
              <p className="text-xs text-emerald-950/55">Made in Germany 🇩🇪</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-emerald-950">INVOICE</h1>
            <p className="font-mono text-sm text-emerald-950/70">
              {order.invoiceNumber}
            </p>
            <p className="text-sm text-emerald-950/55">
              Date: {formatDate(order.orderedAt)}
            </p>
            <div className="mt-2">
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-950/50">
              Billed to
            </h2>
            <p className="mt-2 font-medium text-emerald-950">
              {order.shippingName}
            </p>
            <p className="text-sm text-emerald-950/70">
              {order.shippingAddress}
              <br />
              {order.shippingPostal} {order.shippingCity}
              <br />
              {order.shippingCountry}
            </p>
            <p className="mt-2 text-xs text-emerald-950/55">
              Customer: {order.user.username} ({order.user.email})
            </p>
          </div>
          <div className="sm:text-right">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-950/50">
              Payment
            </h2>
            <p className="mt-2 font-medium text-emerald-950">
              {paymentLabel(order.paymentMethod)}
            </p>
            {order.paymentReference && (
              <p className="font-mono text-sm text-emerald-950/70">
                Ref: {order.paymentReference}
              </p>
            )}
            {order.trackingNumber && (
              <p className="mt-3 text-sm text-emerald-950/70">
                📦 {order.carrier ? `${order.carrier} ` : ""}tracking:{" "}
                <span className="font-mono">{order.trackingNumber}</span>
              </p>
            )}
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-emerald-900/15 text-left text-xs uppercase tracking-wide text-emerald-950/50">
              <th className="py-2">Item</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Unit price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-emerald-900/5">
              <td className="py-3 font-medium text-emerald-950">
                {order.productName}
              </td>
              <td className="py-3 text-center">{order.quantity}</td>
              <td className="py-3 text-right">
                {formatMoney(order.unitPriceCents, order.currency)}
              </td>
              <td className="py-3 text-right">
                {formatMoney(order.unitPriceCents * order.quantity, order.currency)}
              </td>
            </tr>
            <tr>
              <td className="py-3 text-emerald-950/60">
                Shipping (tracked, from Germany)
              </td>
              <td className="py-3 text-center">—</td>
              <td className="py-3 text-right">—</td>
              <td className="py-3 text-right">Free</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-emerald-900/20 text-base font-bold text-emerald-950">
              <td className="py-3" colSpan={3}>
                Total (incl. VAT)
              </td>
              <td className="py-3 text-right">
                {formatMoney(order.amountCents, order.currency)}
              </td>
            </tr>
          </tfoot>
        </table>

        {order.notes && (
          <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900/80">
            📝 {order.notes}
          </p>
        )}

        <p className="mt-8 border-t border-emerald-900/10 pt-4 text-xs text-emerald-950/50">
          Thank you for your order! Questions? Reply to your order confirmation
          email and we&apos;ll help you out. — SnailCream, Germany
        </p>
      </div>
    </div>
  );
}

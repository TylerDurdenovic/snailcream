import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  formatDateTime,
  formatMoney,
  isPaid,
  paymentLabel,
} from "@/lib/shop";
import StatusBadge from "@/components/StatusBadge";
import PrintButton from "@/components/PrintButton";

export const metadata: Metadata = {
  title: "Payment confirmation | SnailCream",
};

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser(`/account/invoices/${id}/receipt`);

  const order = await db.order.findUnique({
    where: { id },
    include: { user: { select: { username: true, email: true } } },
  });
  if (!order) notFound();
  if (order.userId !== user.id && user.role !== "ADMIN") notFound();

  const paid = isPaid(order.status);
  const cancelled = order.status === "CANCELLED";
  // Derived display id — a formatting of the real invoice number, not a new record.
  const confirmationNo = order.invoiceNumber.replace(/^SC-/, "PC-");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="no-print mb-6 flex items-center justify-between">
        <Link
          href={`/account/invoices/${order.id}`}
          className="text-sm font-medium text-emerald-700 hover:underline"
        >
          ← Back to invoice
        </Link>
        {paid && <PrintButton />}
      </div>

      {!paid && (
        <div className="no-print mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-900">
          {cancelled ? (
            <>
              This order is <strong>cancelled</strong>, so there is no payment to
              confirm.
            </>
          ) : (
            <>
              <strong>No payment has been recorded for this order yet.</strong>{" "}
              A confirmation becomes available once the payment is received and
              the order is marked paid. The current status is shown below exactly
              as recorded.
            </>
          )}
        </div>
      )}

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
            <h1 className="text-2xl font-bold text-emerald-950">
              PAYMENT CONFIRMATION
            </h1>
            <p className="font-mono text-sm text-emerald-950/70">
              {confirmationNo}
            </p>
            <p className="text-sm text-emerald-950/55">
              Invoice: {order.invoiceNumber}
            </p>
            <div className="mt-2">
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>

        {/* Payment status banner — reflects the recorded status, nothing more */}
        <div
          className={`mt-8 rounded-2xl border px-5 py-4 ${
            paid
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {paid ? (
            <p>
              <strong>Payment received in full.</strong> This order was paid
              using{" "}
              <strong>{paymentLabel(order.paymentMethod)}</strong>. No credit
              card, debit card, or bank transfer was used for this transaction,
              so no card or bank statement entry exists for it.
            </p>
          ) : (
            <p>
              <strong>Payment not yet received.</strong> This order currently
              has the status <strong>{order.status}</strong> and is not confirmed
              as paid.
            </p>
          )}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-950/50">
              Customer
            </h2>
            <p className="mt-2 font-medium text-emerald-950">
              {order.shippingName}
            </p>
            <p className="text-xs text-emerald-950/55">
              Account: {order.user.username} ({order.user.email})
            </p>
          </div>
          <div className="sm:text-right">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-emerald-950/50">
              Payment method
            </h2>
            <p className="mt-2 font-medium text-emerald-950">
              {paymentLabel(order.paymentMethod)}
            </p>
            {order.paymentReference && (
              <p className="font-mono text-sm text-emerald-950/70">
                Ref: {order.paymentReference}
              </p>
            )}
          </div>
        </div>

        <table className="mt-8 w-full text-sm">
          <tbody>
            <tr className="border-b border-emerald-900/10">
              <td className="py-3 text-emerald-950/60">Order / invoice</td>
              <td className="py-3 text-right font-medium text-emerald-950">
                {order.invoiceNumber}
              </td>
            </tr>
            <tr className="border-b border-emerald-900/10">
              <td className="py-3 text-emerald-950/60">Order date</td>
              <td className="py-3 text-right text-emerald-950">
                {formatDateTime(order.orderedAt)}
              </td>
            </tr>
            <tr className="border-b border-emerald-900/10">
              <td className="py-3 text-emerald-950/60">
                Status last updated in system
              </td>
              <td className="py-3 text-right text-emerald-950">
                {formatDateTime(order.updatedAt)}
              </td>
            </tr>
            <tr className="border-b border-emerald-900/10">
              <td className="py-3 text-emerald-950/60">Item</td>
              <td className="py-3 text-right text-emerald-950">
                {order.quantity} × {order.productName}
              </td>
            </tr>
            <tr className="text-base font-bold text-emerald-950">
              <td className="py-3">
                {paid ? "Amount received" : "Amount due"}
              </td>
              <td className="py-3 text-right">
                {formatMoney(order.amountCents, order.currency)}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="mt-8 border-t border-emerald-900/10 pt-4 text-xs text-emerald-950/50">
          This confirmation is generated directly from SnailCream&apos;s order
          system and reflects the payment information recorded for this order. It
          is not a bank or card statement.
        </p>
      </div>
    </div>
  );
}

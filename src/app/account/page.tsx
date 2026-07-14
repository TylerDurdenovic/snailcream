import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate, formatMoney, paymentLabel } from "@/lib/shop";
import StatusBadge from "@/components/StatusBadge";

export const metadata: Metadata = { title: "My invoices | SnailCream" };

export default async function AccountPage() {
  const user = await requireUser("/account");
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { orderedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-950">
            Hello, {user.username} 👋
          </h1>
          <p className="mt-1 text-emerald-950/60">
            Your orders, invoices and parcel tracking — all in one place.
          </p>
        </div>
        <Link
          href="/product"
          className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          + New order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-emerald-900/20 bg-white p-12 text-center">
          <p className="text-4xl">🐌</p>
          <p className="mt-3 font-medium text-emerald-950">No orders yet</p>
          <p className="mt-1 text-sm text-emerald-950/60">
            Once you order, your invoices show up here.
          </p>
          <Link
            href="/product"
            className="mt-6 inline-block rounded-full bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-800"
          >
            Shop the set
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-emerald-900/10 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-emerald-900/10 text-left text-xs uppercase tracking-wide text-emerald-950/50">
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tracking</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-emerald-900/5 last:border-0 hover:bg-emerald-50/40"
                >
                  <td className="px-4 py-3 font-mono font-medium text-emerald-900">
                    {o.invoiceNumber}
                  </td>
                  <td className="px-4 py-3">{formatDate(o.orderedAt)}</td>
                  <td className="px-4 py-3">
                    {o.quantity} × {o.productName}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {formatMoney(o.amountCents, o.currency)}
                  </td>
                  <td className="px-4 py-3">
                    {paymentLabel(o.paymentMethod)}
                    {o.paymentReference && (
                      <span className="block font-mono text-xs text-emerald-950/50">
                        {o.paymentReference}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {o.trackingNumber ? (
                      <>
                        {o.carrier && (
                          <span className="mr-1 rounded bg-emerald-100 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-emerald-800">
                            {o.carrier}
                          </span>
                        )}
                        {o.trackingNumber}
                      </>
                    ) : (
                      <span className="text-emerald-950/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/account/invoices/${o.id}`}
                      className="font-semibold text-emerald-700 hover:underline"
                    >
                      View invoice →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

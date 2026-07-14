import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  formatDateTime,
  formatMoney,
  paymentLabel,
} from "@/lib/shop";
import StatusBadge from "@/components/StatusBadge";

export const metadata: Metadata = { title: "Admin | SnailCream" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  await requireAdmin();
  const { deleted } = await searchParams;

  const [orders, users] = await Promise.all([
    db.order.findMany({
      orderBy: { orderedAt: "desc" },
      include: { user: { select: { username: true, email: true } } },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    }),
  ]);

  const revenueCents = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.amountCents, 0);
  const pending = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-emerald-950">Admin panel</h1>
          <p className="mt-1 text-emerald-950/60">
            Manage orders, invoices, tracking and customers.
          </p>
        </div>
        <Link
          href="/admin/orders/new"
          className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          + New invoice
        </Link>
      </div>

      {deleted && (
        <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Order deleted.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-950/50">
            Orders
          </p>
          <p className="mt-1 text-3xl font-bold text-emerald-950">
            {orders.length}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-950/50">
            Revenue (excl. cancelled)
          </p>
          <p className="mt-1 text-3xl font-bold text-emerald-950">
            {formatMoney(revenueCents)}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-950/50">
            Pending
          </p>
          <p className="mt-1 text-3xl font-bold text-amber-600">{pending}</p>
        </div>
      </div>

      <h2 className="mt-12 text-xl font-bold text-emerald-950">Orders</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-emerald-900/10 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-emerald-900/10 text-left text-xs uppercase tracking-wide text-emerald-950/50">
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tracking</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-emerald-950/50"
                >
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-b border-emerald-900/5 last:border-0 hover:bg-emerald-50/40"
              >
                <td className="px-4 py-3 font-mono font-medium text-emerald-900">
                  <Link
                    href={`/account/invoices/${o.id}`}
                    className="hover:underline"
                  >
                    {o.invoiceNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {formatDateTime(o.orderedAt)}
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium">{o.user.username}</span>
                  <span className="block text-xs text-emerald-950/50">
                    {o.user.email}
                  </span>
                </td>
                <td className="px-4 py-3">{o.quantity}</td>
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
                  {o.trackingNumber ?? (
                    <span className="text-emerald-950/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="rounded-full border border-emerald-900/15 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 text-xl font-bold text-emerald-950">Customers</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-emerald-900/10 bg-white shadow-sm">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-emerald-900/10 text-left text-xs uppercase tracking-wide text-emerald-950/50">
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Registered</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-emerald-900/5 last:border-0"
              >
                <td className="px-4 py-3 font-medium">{u.username}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  {u.role === "ADMIN" ? (
                    <span className="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                      ADMIN
                    </span>
                  ) : (
                    <span className="text-emerald-950/60">Customer</span>
                  )}
                </td>
                <td className="px-4 py-3">{u._count.orders}</td>
                <td className="px-4 py-3">{formatDateTime(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

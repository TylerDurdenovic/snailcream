"use client";

import { useActionState } from "react";
import {
  adminCreateOrder,
  adminUpdateOrder,
  type FormState,
} from "@/app/actions/orders";
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/shop";

const inputCls =
  "w-full rounded-xl border border-emerald-900/15 bg-white px-3.5 py-2.5 text-sm text-emerald-950 outline-none placeholder:text-emerald-950/35 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";
const labelCls = "mb-1 block text-xs font-semibold uppercase tracking-wide text-emerald-950/55";

export type OrderDefaults = {
  id?: string;
  invoiceNumber: string;
  customer?: string;
  productName: string;
  quantity: number;
  amountEur: string;
  paymentMethod: string;
  paymentReference: string;
  status: string;
  trackingNumber: string;
  carrier: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostal: string;
  shippingCountry: string;
  notes: string;
  orderedAtLocal: string; // YYYY-MM-DDTHH:mm:ss
};

export default function OrderEditor({
  mode,
  defaults,
}: {
  mode: "edit" | "create";
  defaults: OrderDefaults;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    mode === "edit" ? adminUpdateOrder : adminCreateOrder,
    {}
  );

  // After a validation error, React 19 resets uncontrolled fields — restore
  // what the admin typed from the echoed values instead of the DB defaults.
  const v = (name: string, fallback: string | number) =>
    state.values?.[name] ?? String(fallback);

  return (
    <form action={action} className="space-y-6">
      {state.error && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✅ {state.success}
        </p>
      )}

      {mode === "edit" && defaults.id && (
        <input type="hidden" name="id" value={defaults.id} />
      )}

      <section className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-emerald-950">Invoice</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mode === "create" && (
            <div>
              <label className={labelCls}>Customer (username or email)</label>
              <input
                name="customer"
                required
                defaultValue={v("customer", defaults.customer ?? "")}
                className={inputCls}
                placeholder="demo or demo@snailcream.example"
              />
            </div>
          )}
          <div>
            <label className={labelCls}>Invoice number</label>
            <input
              name="invoiceNumber"
              required
              defaultValue={v("invoiceNumber", defaults.invoiceNumber)}
              className={`${inputCls} font-mono`}
            />
          </div>
          <div>
            <label className={labelCls}>Order date &amp; time</label>
            <input
              name="orderedAt"
              type="datetime-local"
              step={1}
              required
              defaultValue={v("orderedAt", defaults.orderedAtLocal)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select
              name="status"
              defaultValue={v("status", defaults.status)}
              className={inputCls}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-emerald-950">Product &amp; amount</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label className={labelCls}>Product name</label>
            <input
              name="productName"
              defaultValue={v("productName", defaults.productName)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Quantity (sets)</label>
            <input
              name="quantity"
              type="number"
              min={1}
              required
              defaultValue={v("quantity", defaults.quantity)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Total amount (EUR)</label>
            <input
              name="amountEur"
              required
              defaultValue={v("amountEur", defaults.amountEur)}
              className={inputCls}
              placeholder="15.00"
            />
          </div>
          <div>
            <label className={labelCls}>Payment method</label>
            <select
              name="paymentMethod"
              defaultValue={v("paymentMethod", defaults.paymentMethod)}
              className={inputCls}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Payment reference</label>
            <input
              name="paymentReference"
              defaultValue={v("paymentReference", defaults.paymentReference)}
              className={`${inputCls} font-mono`}
              placeholder="GC-12345-ONLINE"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold text-emerald-950">Shipping &amp; tracking</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelCls}>Carrier</label>
            <input
              name="carrier"
              defaultValue={v("carrier", defaults.carrier)}
              className={inputCls}
              placeholder="DHL"
            />
          </div>
          <div className="lg:col-span-2">
            <label className={labelCls}>Tracking number</label>
            <input
              name="trackingNumber"
              defaultValue={v("trackingNumber", defaults.trackingNumber)}
              className={`${inputCls} font-mono`}
              placeholder="00340434161094215"
            />
          </div>
          <div>
            <label className={labelCls}>Recipient name</label>
            <input
              name="shippingName"
              defaultValue={v("shippingName", defaults.shippingName)}
              className={inputCls}
            />
          </div>
          <div className="lg:col-span-2">
            <label className={labelCls}>Street</label>
            <input
              name="shippingAddress"
              defaultValue={v("shippingAddress", defaults.shippingAddress)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Postal code</label>
            <input
              name="shippingPostal"
              defaultValue={v("shippingPostal", defaults.shippingPostal)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input
              name="shippingCity"
              defaultValue={v("shippingCity", defaults.shippingCity)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input
              name="shippingCountry"
              defaultValue={v("shippingCountry", defaults.shippingCountry)}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelCls}>Internal notes (shown on invoice)</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={v("notes", defaults.notes)}
              className={inputCls}
            />
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-emerald-700 px-8 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending
          ? "Saving…"
          : mode === "edit"
            ? "Save changes"
            : "Create invoice"}
      </button>
    </form>
  );
}

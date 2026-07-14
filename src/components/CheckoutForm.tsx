"use client";

import { useActionState, useState } from "react";
import { placeOrder, type FormState } from "@/app/actions/orders";
import { formatMoney, PAYMENT_METHODS, PRODUCT } from "@/lib/shop";

const inputCls =
  "w-full rounded-xl border border-emerald-900/15 bg-white px-4 py-3 text-emerald-950 outline-none placeholder:text-emerald-950/35 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20";
const labelCls = "mb-1 block text-sm font-medium text-emerald-950/80";

export default function CheckoutForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(
    placeOrder,
    {}
  );
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState<string>("GIFT_CARD");

  const total = PRODUCT.unitPriceCents * quantity;

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        {state.error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </p>
        )}

        <section className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-emerald-950">1 · Your order</h2>
          <div className="mt-4 flex items-center gap-4">
            <img
              src="/images/box-set.svg"
              alt=""
              className="h-20 w-20 rounded-xl border border-emerald-900/10"
            />
            <div className="flex-1">
              <p className="font-medium text-emerald-950">{PRODUCT.name}</p>
              <p className="text-sm text-emerald-950/60">
                {formatMoney(PRODUCT.unitPriceCents)} per set
              </p>
            </div>
            <div>
              <label className={labelCls} htmlFor="quantity">
                Sets
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                max={50}
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.max(1, Math.min(50, parseInt(e.target.value || "1", 10)))
                  )
                }
                className={`${inputCls} w-24`}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-emerald-950">2 · Shipping address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>Full name</label>
              <input
                name="shippingName"
                required
                className={inputCls}
                placeholder="Max Mustermann"
                defaultValue={state.values?.shippingName ?? ""}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Street and house number</label>
              <input
                name="shippingAddress"
                required
                className={inputCls}
                placeholder="Musterstraße 12"
                defaultValue={state.values?.shippingAddress ?? ""}
              />
            </div>
            <div>
              <label className={labelCls}>Postal code</label>
              <input
                name="shippingPostal"
                required
                className={inputCls}
                placeholder="10115"
                defaultValue={state.values?.shippingPostal ?? ""}
              />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input
                name="shippingCity"
                required
                className={inputCls}
                placeholder="Berlin"
                defaultValue={state.values?.shippingCity ?? ""}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Country</label>
              <input
                name="shippingCountry"
                defaultValue={state.values?.shippingCountry || "Germany"}
                required
                className={inputCls}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-emerald-950">3 · Payment method</h2>
          <div className="mt-4 space-y-3">
            {PAYMENT_METHODS.map((m) => (
              <label
                key={m.value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  method === m.value
                    ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-600/20"
                    : "border-emerald-900/15 hover:bg-emerald-50/50"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={m.value}
                  checked={method === m.value}
                  onChange={() => setMethod(m.value)}
                  className="accent-emerald-700"
                />
                <span className="font-medium text-emerald-950">{m.label}</span>
              </label>
            ))}
          </div>
          {method === "GIFT_CARD" && (
            <div className="mt-4">
              <label className={labelCls}>
                Gift card code / reference (optional)
              </label>
              <input
                name="paymentReference"
                className={inputCls}
                placeholder="e.g. GC-12345-ONLINE"
                defaultValue={state.values?.paymentReference ?? ""}
              />
              <p className="mt-2 text-xs text-emerald-950/55">
                We&apos;ll verify the gift card and mark your invoice as paid.
              </p>
            </div>
          )}
          {method === "BANK_TRANSFER" && (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900/80">
              You&apos;ll receive our SEPA bank details on the invoice. Your order
              ships as soon as the transfer arrives.
            </p>
          )}
          {method === "PAYPAL" && (
            <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900/80">
              We&apos;ll send a PayPal payment request to your account email.
            </p>
          )}
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm lg:sticky lg:top-24">
        <h2 className="font-semibold text-emerald-950">Summary</h2>
        <dl className="mt-4 space-y-2 text-sm text-emerald-950/70">
          <div className="flex justify-between">
            <dt>
              {quantity} × set ({PRODUCT.boxes} × {PRODUCT.gramsPerBox}g)
            </dt>
            <dd>{formatMoney(total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Shipping (tracked, from Germany)</dt>
            <dd>Free</dd>
          </div>
          <div className="flex justify-between border-t border-emerald-900/10 pt-3 text-base font-bold text-emerald-950">
            <dt>Total</dt>
            <dd>{formatMoney(total)}</dd>
          </div>
        </dl>
        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-xl bg-emerald-700 px-4 py-3.5 font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "Placing order…" : `Place order — ${formatMoney(total)}`}
        </button>
        <p className="mt-3 text-center text-xs text-emerald-950/50">
          Your invoice appears instantly in your account.
        </p>
      </aside>
    </form>
  );
}

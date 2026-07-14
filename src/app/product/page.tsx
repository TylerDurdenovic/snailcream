import Link from "next/link";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { formatMoney, PRODUCT } from "@/lib/shop";

export const metadata: Metadata = {
  title: "Snail Cream Set (5 × 10g) — €15 | SnailCream",
};

export default async function ProductPage() {
  const session = await getSession();
  const orderHref = session
    ? "/checkout"
    : "/login?next=%2Fcheckout";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <nav className="mb-6 text-sm text-emerald-950/50">
        <Link href="/" className="hover:text-emerald-800">
          Home
        </Link>{" "}
        / <span className="text-emerald-950/80">Snail Cream Set</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <img
            src="/images/jar.svg"
            alt="SnailCream jar"
            className="w-full rounded-3xl border border-emerald-900/10 shadow-sm"
          />
          <img
            src="/images/box-set.svg"
            alt="Set of five SnailCream boxes"
            className="w-full rounded-3xl border border-emerald-900/10 shadow-sm"
          />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">
            {PRODUCT.name}
          </h1>
          <p className="mt-2 text-emerald-950/60">
            Premium Schneckencreme · handcrafted in Germany 🇩🇪
          </p>

          <div className="mt-6 flex items-end gap-3">
            <span className="text-4xl font-extrabold text-emerald-700">
              {formatMoney(PRODUCT.unitPriceCents)}
            </span>
            <span className="pb-1 text-emerald-950/55">
              per set of {PRODUCT.boxes} × {PRODUCT.gramsPerBox}g boxes
            </span>
          </div>
          <p className="mt-1 text-sm text-emerald-950/50">
            That&apos;s {formatMoney(PRODUCT.unitPriceCents / PRODUCT.boxes)} per box
            · incl. VAT · free EU shipping
          </p>

          <div className="mt-8 rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-emerald-950">What you get</h2>
            <ul className="mt-3 space-y-2 text-sm text-emerald-950/70">
              <li>
                🐌 {PRODUCT.boxes} sealed boxes, each with{" "}
                {PRODUCT.gramsPerBox}g of snail mucin cream
              </li>
              <li>💧 Intense hydration with natural snail secretion filtrate</li>
              <li>🌿 Enriched with allantoin, glycerin and vitamin E</li>
              <li>🧴 Light texture, absorbs quickly, no sticky feeling</li>
              <li>🇩🇪 Produced and packed in Germany (EU cosmetics regulation)</li>
            </ul>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href={orderHref}
              className="rounded-full bg-emerald-700 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800"
            >
              Order now
            </Link>
            {!session && (
              <p className="self-center text-sm text-emerald-950/55">
                You&apos;ll be asked to log in or register first.
              </p>
            )}
          </div>

          <div className="mt-8 grid gap-3 text-sm text-emerald-950/65 sm:grid-cols-3">
            <div className="rounded-xl bg-emerald-50 p-4">
              💳 Gift card, bank transfer or PayPal
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              📦 Tracked DHL shipping from Germany
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              🧾 Invoice always available in your account
            </div>
          </div>

          <div className="mt-8 text-sm leading-relaxed text-emerald-950/60">
            <h3 className="font-semibold text-emerald-950">How to use</h3>
            <p className="mt-2">
              Apply a small amount to cleansed skin in the morning and evening.
              Gently massage until absorbed. For external use only. Store cool
              and dry, use within 6 months of opening.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { formatMoney, PRODUCT } from "@/lib/shop";

const FEATURES = [
  {
    title: "Made in Germany",
    text: "Produced in small batches in Germany under strict EU cosmetic standards.",
    icon: "🇩🇪",
  },
  {
    title: "Rich in snail mucin",
    text: "Naturally hydrating snail secretion filtrate for soft, glowing skin.",
    icon: "✨",
  },
  {
    title: "5 handy travel boxes",
    text: "Each set contains five 10g boxes — perfect for home, bag and travel.",
    icon: "📦",
  },
  {
    title: "EU-wide shipping",
    text: "Tracked shipping across the European Union, straight from Germany.",
    icon: "🚚",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-50 via-[#fdfcf9] to-teal-50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-700/20 bg-white px-4 py-1.5 text-sm font-medium text-emerald-800 shadow-sm">
              🐌 Premium Schneckencreme · Made in Germany
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-emerald-950 sm:text-5xl">
              Glow like never before with{" "}
              <span className="text-emerald-600">snail mucin</span> cream
            </h1>
            <p className="mt-5 max-w-xl text-lg text-emerald-950/70">
              Deep hydration, gentle repair and a natural glow — handcrafted in
              Germany. Get the full set of{" "}
              <strong>
                {PRODUCT.boxes} boxes × {PRODUCT.gramsPerBox}g
              </strong>{" "}
              for just <strong>{formatMoney(PRODUCT.unitPriceCents)}</strong>.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/product"
                className="rounded-full bg-emerald-700 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-800"
              >
                Shop the set — {formatMoney(PRODUCT.unitPriceCents)}
              </Link>
              <Link
                href="/register"
                className="rounded-full border border-emerald-900/15 bg-white px-6 py-3.5 text-base font-semibold text-emerald-900 hover:bg-emerald-50"
              >
                Create account
              </Link>
            </div>
            <p className="mt-4 text-sm text-emerald-950/50">
              Pay by gift card, bank transfer or PayPal · Tracked delivery
            </p>
          </div>
          <div className="relative">
            <img
              src="/images/jar.svg"
              alt="SnailCream jar with open lid"
              className="w-full max-w-md justify-self-center rounded-3xl shadow-xl shadow-emerald-900/10 md:ml-auto"
            />
            <div className="absolute -bottom-4 -left-2 rounded-2xl bg-white px-5 py-3 shadow-lg ring-1 ring-emerald-900/10">
              <p className="text-xs uppercase tracking-wide text-emerald-950/50">
                Full set
              </p>
              <p className="text-xl font-bold text-emerald-800">
                {formatMoney(PRODUCT.unitPriceCents)}{" "}
                <span className="text-sm font-medium text-emerald-950/60">
                  / {PRODUCT.boxes} × {PRODUCT.gramsPerBox}g
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-emerald-950">
          Why SnailCream?
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold text-emerald-950">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-emerald-950/65">
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Set showcase */}
      <section className="bg-emerald-950 text-emerald-50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2">
          <img
            src="/images/box-set.svg"
            alt="Set of five SnailCream boxes"
            className="w-full max-w-md rounded-3xl"
          />
          <div>
            <h2 className="text-3xl font-bold">
              One set. Five boxes. {formatMoney(PRODUCT.unitPriceCents)}.
            </h2>
            <ul className="mt-6 space-y-3 text-emerald-100/85">
              <li>
                ✅ {PRODUCT.boxes} × {PRODUCT.gramsPerBox}g of pure snail mucin
                cream
              </li>
              <li>✅ Dermatologically gentle, suitable for daily use</li>
              <li>✅ No parabens, no mineral oils, cruelty-conscious harvesting</li>
              <li>✅ Order online — invoice &amp; tracking in your account</li>
            </ul>
            <Link
              href="/product"
              className="mt-8 inline-block rounded-full bg-emerald-400 px-7 py-3.5 font-semibold text-emerald-950 transition hover:bg-emerald-300"
            >
              Order your set now
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-emerald-950">
          How ordering works
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Register & order",
              text: "Create your free account, choose how many sets you want and place your order.",
            },
            {
              step: "2",
              title: "Pay your way",
              text: "Pay with a gift card, SEPA bank transfer or PayPal. We confirm your payment quickly.",
            },
            {
              step: "3",
              title: "Track everything",
              text: "Your invoice, payment status and parcel tracking number live in your account.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="rounded-2xl border border-emerald-900/10 bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 font-bold text-white">
                {s.step}
              </div>
              <h3 className="mt-4 font-semibold text-emerald-950">{s.title}</h3>
              <p className="mt-2 text-sm text-emerald-950/65">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

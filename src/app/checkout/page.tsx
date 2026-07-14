import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import CheckoutForm from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout | SnailCream" };

export default async function CheckoutPage() {
  await requireUser("/checkout");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-emerald-950">Checkout</h1>
      <p className="mt-1 mb-8 text-emerald-950/60">
        Almost there — tell us where to ship your snail cream.
      </p>
      <CheckoutForm />
    </div>
  );
}

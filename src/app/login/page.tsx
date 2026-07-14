import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LoginForm } from "@/components/AuthForms";
import { getVerifiedUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Log in | SnailCream" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // getVerifiedUser (not getSession): a valid JWT for a deleted user must
  // not bounce back to /account, or the two pages redirect in a loop.
  const user = await getVerifiedUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/account");

  const { next } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-emerald-900/10 bg-white p-8 shadow-sm">
        <img src="/images/snail-logo.svg" alt="" className="mx-auto h-12 w-12" />
        <h1 className="mt-4 text-center text-2xl font-bold text-emerald-950">
          Welcome back
        </h1>
        <p className="mt-1 mb-6 text-center text-sm text-emerald-950/60">
          Log in to see your orders, invoices and tracking.
        </p>
        <LoginForm next={next} />
        <p className="mt-6 text-center text-sm text-emerald-950/60">
          No account yet?{" "}
          <Link
            href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"}
            className="font-semibold text-emerald-700 hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

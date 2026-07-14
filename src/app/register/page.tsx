import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/AuthForms";
import { getVerifiedUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Register | SnailCream" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // See login/page.tsx — must check the DB row, not just the cookie.
  const user = await getVerifiedUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/account");

  const { next } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-3xl border border-emerald-900/10 bg-white p-8 shadow-sm">
        <img src="/images/snail-logo.svg" alt="" className="mx-auto h-12 w-12" />
        <h1 className="mt-4 text-center text-2xl font-bold text-emerald-950">
          Create your account
        </h1>
        <p className="mt-1 mb-6 text-center text-sm text-emerald-950/60">
          Order snail cream and keep all your invoices in one place.
        </p>
        <RegisterForm next={next} />
        <p className="mt-6 text-center text-sm text-emerald-950/60">
          Already registered?{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="font-semibold text-emerald-700 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

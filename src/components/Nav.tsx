import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logout } from "@/app/actions/auth";

export default async function Nav() {
  const session = await getSession();

  return (
    <header className="no-print sticky top-0 z-20 border-b border-emerald-900/10 bg-[#fdfcf9]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <img src="/images/snail-logo.svg" alt="" className="h-9 w-9" />
          <span className="text-lg font-bold tracking-tight text-emerald-950">
            Snail<span className="text-emerald-600">Cream</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 text-sm font-medium sm:gap-2">
          <Link
            href="/product"
            className="rounded-full px-3 py-2 text-emerald-950/80 hover:bg-emerald-50 hover:text-emerald-900"
          >
            Shop
          </Link>

          {session ? (
            <>
              <Link
                href="/account"
                className="rounded-full px-3 py-2 text-emerald-950/80 hover:bg-emerald-50 hover:text-emerald-900"
              >
                My invoices
              </Link>
              {session.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="rounded-full px-3 py-2 text-amber-700 hover:bg-amber-50"
                >
                  Admin
                </Link>
              )}
              <span className="hidden px-2 text-emerald-950/50 sm:inline">
                {session.username}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-full border border-emerald-900/15 px-3 py-2 text-emerald-950/80 hover:bg-emerald-50"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-emerald-950/80 hover:bg-emerald-50 hover:text-emerald-900"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-emerald-700 px-4 py-2 text-white shadow-sm hover:bg-emerald-800"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

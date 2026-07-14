import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SnailCream — Premium Snail Mucin Cream from Germany",
  description:
    "Handcrafted snail mucin cream, made in Germany. 5 boxes × 10g for €15, shipped across Europe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="no-print border-t border-emerald-900/10 bg-emerald-950 text-emerald-100/80">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} SnailCream — Made in Germany 🇩🇪
            </p>
            <p>5 × 10g snail mucin cream · €15 per set · EU-wide shipping</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

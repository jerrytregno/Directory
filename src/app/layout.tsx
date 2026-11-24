import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSession } from "@/lib/auth";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SaaSListingHub — AI Tools & Business Directory",
    template: "%s · SaaSListingHub",
  },
  description:
    "Discover and submit AI tools, SaaS products, software, startups, and businesses. Listing on SaaSListingHub is free.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="en" className={sans.variable}>
      <body className="flex min-h-screen flex-col antialiased">
        <SiteHeader user={session ? { name: session.name, email: session.email, role: session.role } : null} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

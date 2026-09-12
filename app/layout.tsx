import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyBookBar from "@/components/StickyBookBar";
import AnnouncementBanner from "@/components/AnnouncementBanner";

// Every page in this app reads admin-editable content (contact info, announcement
// banner, hero text, etc.) via Header/Footer/page bodies, which touch the SQLite
// database directly. Forcing the whole app dynamic here — once, in the root layout —
// means every route always reflects the latest admin changes, rather than each new
// page needing its own `export const dynamic = 'force-dynamic'` remembered
// individually (a mistake that already caused stale-content bugs earlier).
export const dynamic = "force-dynamic";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
});
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Sabrina Beauty — Skincare, Facials & Spa Treatments",
  description:
    "Your sanctuary for luxurious, results-focused facial treatments designed to enhance your natural beauty.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${serif.variable} ${sans.variable} font-sans bg-cream text-charcoal`}
      >
        <AnnouncementBanner />
        <Header />
        <main className="pb-20 md:pb-0">{children}</main>
        <Footer />
        <StickyBookBar />
      </body>
    </html>
  );
}

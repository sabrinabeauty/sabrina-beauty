import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyBookBar from "@/components/StickyBookBar";

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
        <Header />
        <main className="pb-20 md:pb-0">{children}</main>
        <Footer />
        <StickyBookBar />
      </body>
    </html>
  );
}

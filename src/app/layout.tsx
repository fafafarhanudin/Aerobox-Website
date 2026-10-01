import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/sections/footer";
import { site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Aerobox Design — Farhan designs websites, dashboards, mobile apps and brand systems for SaaS, AI, B2B and Web3 teams.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? site.url),
  title: {
    default: "Aerobox — Designing world-class digital experiences",
    template: "%s · Aerobox",
  },
  description,
  openGraph: {
    title: "Aerobox — Designing world-class digital experiences",
    description,
    siteName: "Aerobox",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@UI_Farhan",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="mx-auto max-w-[1440px] min-[1442px]:border-x min-[1442px]:border-line">
          <Nav />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

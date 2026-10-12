import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@/components/analytics";
import { BackToTop } from "@/components/back-to-top";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/sections/footer";
import { site, socials } from "@/lib/site";
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

// Who and what this site is, for search engines: the designer and the studio, no street address (remote work)
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${site.url}/#farhan`,
      name: "Muhammad Farhanudin",
      alternateName: "Farhan",
      jobTitle: "Product & brand designer",
      url: site.url,
      email: `mailto:${site.email}`,
      worksFor: { "@id": `${site.url}/#studio` },
      sameAs: Object.values(socials).map((s) => s.href),
    },
    {
      "@type": "ProfessionalService",
      "@id": `${site.url}/#studio`,
      name: "Aerobox",
      description,
      url: site.url,
      logo: `${site.url}/icon.png`,
      image: `${site.url}/opengraph-image.jpg`,
      email: site.email,
      founder: { "@id": `${site.url}/#farhan` },
      areaServed: "Worldwide",
      knowsAbout: ["Web design", "Dashboard design", "Mobile app design", "Branding", "Pitch decks", "Framer"],
      sameAs: Object.values(socials).map((s) => s.href),
    },
    { "@type": "WebSite", "@id": `${site.url}/#website`, name: "Aerobox", url: site.url, publisher: { "@id": `${site.url}/#studio` } },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <div className="mx-auto max-w-[1440px] min-[1442px]:border-x min-[1442px]:border-line">
          <Nav />
          <main>{children}</main>
          <Footer />
        <BackToTop />
        <Analytics />
        </div>
      </body>
    </html>
  );
}

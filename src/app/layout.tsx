import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Mono, DM_Sans } from "next/font/google";
import { business } from "@/config/business";
import { siteConfig } from "@/config/site";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import "./globals.css";

// Fonts are downloaded at build time and self-hosted by next/font –
// no request to Google is made by visitors' browsers.
const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});
const sans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});
const mono = DM_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `Snack-, Getränke- & Kaffeeautomaten in Esslingen und Stuttgart | ${business.brand}`,
    template: `%s | ${business.brand}`,
  },
  description: siteConfig.description,
  applicationName: business.brand,
  authors: [{ name: business.legalName }],
  creator: business.brand,
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: business.brand,
    title: `${business.brand} – ${business.slogan}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${business.brand} – ${business.slogan}`,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#12382A",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de-DE" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#inhalt"
          className="sr-only z-[100] rounded-key bg-ink px-4 py-3 font-medium text-cream focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Zum Inhalt springen
        </a>
        <Header />
        <main id="inhalt" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  );
}

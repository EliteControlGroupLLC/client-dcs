import type { Metadata, Viewport } from "next";
import { Red_Hat_Display, Crimson_Text, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FloatingEstimateButton } from "@/components/instant-estimate/floating-estimate-button";
import { SITE_URL } from "@/lib/site-url";

// TruthCore brand typefaces: Red Hat Display (primary) + Crimson Text (secondary)
const redHat = Red_Hat_Display({
  variable: "--font-redhat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  display: "swap",
});

const crimson = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "TruthCore | San Diego ADU & Home Construction",
  description:
    "TruthCore, a DBA of Distinct Construction Solutions, is San Diego's premier design-build construction company specializing in ADUs, custom homes, remodeling, and renovations. Get your free consultation today.",
  keywords: [
    "ADU San Diego",
    "home construction",
    "remodeling",
    "design-build",
    "custom homes",
    "accessory dwelling units",
  ],
  authors: [{ name: "TruthCore (Distinct Construction Solutions)" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "TruthCore | San Diego ADU & Home Construction",
    description:
      "TruthCore, a DBA of Distinct Construction Solutions, is San Diego's premier design-build construction company specializing in ADUs, custom homes, remodeling, and renovations.",
    url: SITE_URL,
    siteName: "TruthCore",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "TruthCore - San Diego ADU & Home Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TruthCore | San Diego ADU & Home Construction",
    description: "San Diego's premier design-build construction company. TruthCore is a DBA of Distinct Construction Solutions.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#336666",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "TruthCore",
  legalName: "Distinct Construction Solutions",
  alternateName: "Distinct Construction Solutions",
  description:
    "San Diego's premier design-build construction company specializing in ADUs, custom homes, remodeling, and renovations.",
  url: SITE_URL,
  logo: `${SITE_URL}/images/truthcore-logo.png`,
  image: `${SITE_URL}/og-image.jpg`,
  telephone: "+1-858-833-0705",
  address: {
    "@type": "PostalAddress",
    streetAddress: "3527 Citrus St",
    addressLocality: "Lemon Grove",
    addressRegion: "CA",
    postalCode: "91945",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 32.7425,
    longitude: -117.0314,
  },
  areaServed: {
    "@type": "City",
    name: "San Diego",
  },
  serviceType: [
    "ADU Construction",
    "Custom Home Building",
    "Home Remodeling",
    "Garage Conversions",
    "Room Additions",
  ],
  priceRange: "$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00",
    closes: "18:00",
  },
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5KJT4QTZ');`,
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '105630589031055');
            fbq('track', 'PageView');`,
          }}
        />
      </head>

      <body
        className={`${redHat.variable} ${crimson.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5KJT4QTZ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <FloatingEstimateButton />
      </body>
    </html>
  );
}

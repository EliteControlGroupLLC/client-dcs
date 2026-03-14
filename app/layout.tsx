import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Distinct Construction Solutions | San Diego ADU & Home Construction",
  description: "San Diego's premier design-build construction company specializing in ADUs, custom homes, remodeling, and renovations. Get your free consultation today.",
  keywords: ["ADU San Diego", "home construction", "remodeling", "design-build", "custom homes", "accessory dwelling units"],
  authors: [{ name: "Distinct Construction Solutions" }],
  openGraph: {
    title: "Distinct Construction Solutions | San Diego ADU & Home Construction",
    description: "San Diego's premier design-build construction company specializing in ADUs, custom homes, remodeling, and renovations.",
    url: "https://client-dcs.vercel.app",
    siteName: "Distinct Construction Solutions",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Distinct Construction Solutions - San Diego ADU & Home Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Distinct Construction Solutions",
    description: "San Diego's premier design-build construction company",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#3ECDA2",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Distinct Construction Solutions",
  "description": "San Diego's premier design-build construction company specializing in ADUs, custom homes, remodeling, and renovations.",
  "url": "https://distinctconstructionsolutions.com",
  "logo": "https://distinctconstructionsolutions.com/images/logo-light.png",
  "image": "https://distinctconstructionsolutions.com/images/logo-light.png",
  "telephone": "+1-619-555-0123",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "San Diego",
    "addressRegion": "CA",
    "addressCountry": "US",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 32.7157,
    "longitude": -117.1611,
  },
  "areaServed": {
    "@type": "City",
    "name": "San Diego",
  },
  "serviceType": [
    "ADU Construction",
    "Custom Home Building",
    "Home Remodeling",
    "Garage Conversions",
    "Room Additions",
  ],
  "priceRange": "$$",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "08:00",
    "closes": "18:00",
  },
  "sameAs": [],
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
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5KJT4QTZ');`,
          }}
        />
        {/* Meta Pixel */}
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
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5KJT4QTZ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

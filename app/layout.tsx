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
    url: "https://distinctconstructionsolutions.com",
    siteName: "Distinct Construction Solutions",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Distinct Construction Solutions",
    description: "San Diego's premier design-build construction company",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

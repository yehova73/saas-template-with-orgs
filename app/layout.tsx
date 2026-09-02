import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import { GeneralProviders } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "[placeholder title]",
  description: "[placeholder description]",
  keywords: ["[placeholder keyword 1]", "[placeholder keyword 2]"],
  authors: [{ name: "[placeholder title]" }],
  creator: "[placeholder title]",
  publisher: "[placeholder title]",
  metadataBase: new URL("https://example.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "[placeholder og title]",
    description: "[placeholder og description]",
    url: "https://example.com",
    siteName: "[placeholder title]",
    images: [
      {
        url: "/og-landing.png", // Recommended: 1200x630px showcase graphic
        width: 1200,
        height: 630,
        alt: "[placeholder og image alt]",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "[placeholder twitter title]",
    description: "[placeholder twitter description]",
    images: ["/og-landing.png"],
    creator: "[placeholder social handle]",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`} suppressHydrationWarning>
      <body
        className={`${sora.variable} ${manrope.variable} min-h-full flex flex-col`}
      >
        <GeneralProviders>{children}</GeneralProviders>
        <Analytics />
      </body>
    </html>
  );
}

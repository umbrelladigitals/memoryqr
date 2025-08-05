import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://memoryqr.com'),
  title: {
    default: "MemoryQR - QR Kod ile Etkinlik Fotoğraf Paylaşımı",
    template: "%s | MemoryQR"
  },
  description: "QR kod teknolojisi ile etkinlik fotoğraflarını toplama, düzenleme ve paylaşma konusunda Türkiye'nin en yenilikçi platformu. Düğün, doğum günü, kurumsal etkinlikler için profesyonel çözüm.",
  keywords: ["QR kod", "etkinlik fotoğrafları", "fotoğraf paylaşımı", "düğün fotoğrafları", "etkinlik yönetimi", "dijital fotoğraf albümü", "misafir fotoğrafları"],
  authors: [{ name: "MemoryQR Team" }],
  creator: "MemoryQR",
  publisher: "MemoryQR",
  applicationName: "MemoryQR",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://memoryqr.com",
    siteName: "MemoryQR",
    title: "MemoryQR - QR Kod ile Etkinlik Fotoğraf Paylaşımı",
    description: "QR kod teknolojisi ile etkinlik fotoğraflarını toplama, düzenleme ve paylaşma konusunda Türkiye'nin en yenilikçi platformu.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MemoryQR - QR Kod ile Etkinlik Fotoğraf Paylaşımı",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@memoryqr",
    creator: "@memoryqr",
    title: "MemoryQR - QR Kod ile Etkinlik Fotoğraf Paylaşımı",
    description: "QR kod teknolojisi ile etkinlik fotoğraflarını toplama, düzenleme ve paylaşma konusunda Türkiye'nin en yenilikçi platformu.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#3B82F6" },
    ],
  },
  manifest: "/manifest.json",
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  alternates: {
    canonical: "https://memoryqr.com",
    languages: {
      'tr-TR': 'https://memoryqr.com',
      'en-US': 'https://memoryqr.com/en',
    },
  },
  category: "Technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MemoryQR" />
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <a href="#main-content" className="skip-to-content">
          Ana içeriğe geç
        </a>
        <ErrorBoundary>
          <SessionProvider>
            <main id="main-content">
              {children}
            </main>
            <Toaster />
          </SessionProvider>
        </ErrorBoundary>
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "MemoryQR",
              "description": "QR kod teknolojisi ile etkinlik fotoğraflarını toplama, düzenleme ve paylaşma platformu",
              "url": "https://memoryqr.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "TRY"
              },
              "provider": {
                "@type": "Organization",
                "name": "MemoryQR",
                "url": "https://memoryqr.com"
              }
            })
          }}
        />
      </body>
    </html>
  );
}

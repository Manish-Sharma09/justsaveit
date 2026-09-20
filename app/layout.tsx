import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { APP_NAME } from "@/lib/config";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo";

/**
 * Geist is the face DESIGN.md specifies. next/font self-hosts it at build
 * time, so there is no request to a third-party font CDN at runtime and no
 * layout shift while it loads.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * The hero headline only. A high-contrast display serif against Geist's
 * grotesque is the whole reason the hero reads as a stage rather than as more
 * product chrome — everywhere else, Geist still carries the type.
 */
const instrumentSerif = Instrument_Serif({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  // Lets Next resolve the relative OG image and canonical below to absolute
  // URLs, which is what crawlers and social scrapers require.
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_TITLE,
    template: `%s · ${APP_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: SITE_KEYWORDS,
  category: "technology",
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,

  alternates: { canonical: "/" },

  /**
   * `app/favicon.ico` is picked up by Next's file convention and served at
   * /favicon.ico for browsers and bookmark bars that ask for it by name. The
   * PNGs below are what modern browsers actually pick.
   */
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",

  openGraph: {
    type: "website",
    url: "/",
    siteName: APP_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/og-file-transfer.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "Just Save It — free and secure file transfer with no login",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-file-transfer.jpg",
        alt: "Just Save It — free and secure file transfer with no login",
      },
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  appleWebApp: { capable: true, title: APP_NAME, statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

/**
 * Applies the stored theme before first paint so there is no flash of the
 * wrong colour scheme. Kept tiny and dependency-free on purpose.
 */
const themeScript = `(function(){try{var t=localStorage.getItem("jsi-theme")||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} min-h-dvh`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-sm focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-ink"
        >
          Skip to content
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

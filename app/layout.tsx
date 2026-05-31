import type { Metadata, Viewport } from "next";
import { ConnectionStatus } from "@/components/nightos/connection-status";
import { FeedbackLink } from "@/components/nightos/feedback-link";
import { InstallPrompt } from "@/components/nightos/install-prompt";
import { ServiceWorkerRegister } from "@/components/nightos/service-worker-register";
import { NavigationProgress } from "@/components/navigation-progress";
import "./globals.css";

// Set NEXT_PUBLIC_APP_URL to your production canonical URL (e.g.
// https://nightos.example.com) so OG tags / robots / RSS resolve
// against an absolute origin instead of the random Vercel preview
// hostname.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "NIGHTOS",
    template: "%s | NIGHTOS",
  },
  description:
    "夜のお店のためのワークスペース。店舗が入力し、キャストが活用する。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NIGHTOS",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "NIGHTOS",
  },
  robots: {
    // Production deployments should override via env / per-page metadata
    // when the site is ready to be indexed.
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#e8b9a5",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* Fonts loaded at runtime via <link> so builds don't require
            Google Fonts network access. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&family=Noto+Serif+JP:wght@400;500;600&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Apple touch icon for "Add to Home Screen" */}
        <link rel="apple-touch-icon" href="/ruri-mama-b.svg" />
      </head>
      <body className="font-sans bg-pearl text-ink antialiased">
        <NavigationProgress />
        <ConnectionStatus />
        {children}
        <FeedbackLink />
        <InstallPrompt />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

import "./globals.css";
import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-visual"
};

export const metadata: Metadata = {
  title: "Arthur",
  description: "Short-form AI-focused video content platform",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Arthur"
  },
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-black overscroll-none touch-manipulation">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

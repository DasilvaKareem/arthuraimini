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

// export const metadata: Metadata = {
//   title: "Arthur",
//   description: "Short-form AI-focused video content platform",
//   appleWebApp: {
//     capable: true,
//     statusBarStyle: "black-translucent",
//     title: "Arthur"
//   },
//   themeColor: "#000000",
//   viewport: "width=device-width, initial-scale=1, maximum-scale=1"
// };

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL || "https://arthurai.app";
  return {
    title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Arthur",
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Short-form AI-focused video content platform",
    themeColor: "#000000",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Arthur"
    },
    viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    other: {
      "fc:frame": JSON.stringify({
        version: "1",
        image: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || "/arthur-hero.jpg",
        buttons: [
          {
            label: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Arthur"}`,
            action: "post_redirect"
          }
        ],
        post_url: `${URL}/api/webhook`,
        input: {
          text: "Tell us what you think!"
        }
      }),
    },
  };
}

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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="frame-capable" content="yes" />
      </head>
      <body className="bg-black overscroll-none touch-manipulation">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

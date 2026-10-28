import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

// One face for the whole interface.
const rubik = Rubik({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const title = "CsgoNeo — CS2 Case Opening, Battles & Games";
const description = "Open CS2 cases, battle other players and play Upgrader, Mines, Crash and more on CsgoNeo.";

// The tab icon, the home-screen icon and the picture shown when a link is
// shared (app/icon.svg, apple-icon.png, opengraph-image.png and
// twitter-image.png) are picked up by Next from their file names. Shared
// links need the site's address: set NEXT_PUBLIC_SITE_URL when it goes live.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title,
  description,
  openGraph: { title, description, siteName: "CsgoNeo", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#0f1022",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rubik.variable} antialiased`}>{children}</body>
    </html>
  );
}

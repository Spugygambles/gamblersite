import type { Metadata, Viewport } from "next";
import { Rubik, Unbounded } from "next/font/google";
import "./globals.css";

// Rubik for the interface; Unbounded for the wordmark and headlines.
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const unbounded = Unbounded({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Spugy — CS2 Case Opening, Battles & Games",
  description: "Open CS2 cases, battle other players and play Upgrader, Mines, Crash and more on Spugy.",
};

export const viewport: Viewport = {
  themeColor: "#0c1118",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rubik.variable} ${unbounded.variable} antialiased`}>{children}</body>
    </html>
  );
}

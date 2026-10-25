import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Rubik, VT323 } from "next/font/google";
import "./globals.css";

// Rubik for the interface, JetBrains Mono for little readouts (timers,
// counts), and VT323, an old terminal face, for the boot screen.
const rubik = Rubik({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const terminal = VT323({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "CsgoNeo — CS2 Case Opening, Battles & Games",
  description: "Open CS2 cases, battle other players and play Upgrader, Mines, Crash and more on CsgoNeo.",
};

export const viewport: Viewport = {
  themeColor: "#0a0e0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rubik.variable} ${mono.variable} ${terminal.variable} antialiased`}>{children}</body>
    </html>
  );
}

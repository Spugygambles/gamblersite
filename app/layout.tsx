import type { Metadata, Viewport } from "next";
import { Russo_One, Rubik } from "next/font/google";
import "./globals.css";

// Rubik for the interface; Russo One only for the Rustwild wordmark.
const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const russo = Russo_One({
  variable: "--font-russo",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Rustwild — CS2 Cases, Battles & Games",
  description: "Open cases, battle other players and play Mines, Crash, Upgrader and more on Rustwild.",
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
      <body className={`${rubik.variable} ${russo.variable} antialiased`}>{children}</body>
    </html>
  );
}

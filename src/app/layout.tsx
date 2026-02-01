import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eva Paradis — Exclusive Content",
  description:
    "Welcome to the unfiltered side. Exclusive content, real moments, no limits. Join Eva Paradis.",
  openGraph: {
    title: "Eva Paradis — Exclusive Content",
    description:
      "Welcome to the unfiltered side. Exclusive content, real moments, no limits.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eva Paradis — Exclusive Content",
    description:
      "Welcome to the unfiltered side. Exclusive content, real moments, no limits.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

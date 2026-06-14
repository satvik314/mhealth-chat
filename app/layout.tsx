import type { Metadata } from "next";
import { Playfair_Display, Lora, Special_Elite, Oswald } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-body",
});

const special = Special_Elite({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-type",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-label",
});

export const metadata: Metadata = {
  title: "The Mindful Digest — A Companion for the Modern Mind",
  description:
    "A retro wellness magazine and AI companion offering a quiet corner for your thoughts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${lora.variable} ${special.variable} ${oswald.variable}`}
      >
        {children}
      </body>
    </html>
  );
}

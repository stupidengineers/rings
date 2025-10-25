import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto_Serif } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/root/Navbar";
import Sides from "@/components/Sides";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const primaryFont = Roboto_Serif({
  variable: "--font-roboto-serif",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vichaar",
  description: "A platform for sharing ideas and opinions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${primaryFont.variable} antialiased`}>
        <Sides />
        <Navbar />
        {children}
      </body>
    </html>
  );
}

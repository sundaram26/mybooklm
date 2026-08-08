import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Noetalm - Embeddable Intelligence",
  description: "Where Your Knowledge Meets Instant Intelligence, Anywhere You Publish",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} antialiased scroll-smooth`}
    >
      <body className="min-h-screen bg-paper text-ink font-body flex flex-col selection:bg-accent/20 selection:text-accent">
        {children}
      </body>
    </html>
  );
}

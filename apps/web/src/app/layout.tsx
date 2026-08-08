import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { QueryProvider } from "../components/providers/QueryProvider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "noetalm - Grounded AI Research & Synthesis",
  description: "Grounded research platform for your custom documents, notes, web links, and media.",
  openGraph: {
    title: "noetalm - Grounded AI Research & Synthesis",
    description: "Grounded research platform for your custom documents, notes, web links, and media.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "noetalm - Grounded AI Research & Synthesis",
    description: "Grounded research platform for your custom documents, notes, web links, and media.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable}`}>
        <QueryProvider>
          <ThemeProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

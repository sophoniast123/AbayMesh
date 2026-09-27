import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AbayMesh — AI-Powered Supply Chain Data Interoperability",
    template: "%s · AbayMesh",
  },
  description:
    "Connect fragmented supply-chain data, intelligently map different schemas, and transform them into one trusted, unified data layer.",
  openGraph: {
    title: "AbayMesh — AI-Powered Supply Chain Data Interoperability",
    description:
      "Connect fragmented supply-chain data, intelligently map different schemas, and transform them into one trusted, unified data layer.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0c2340",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas text-navy-900">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
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
  title: "Startup Intelligence Platform - Phase 4: Visual Enrichment & Analytics", // [x] Phase 4: Visual Enrichment & Analytics <!-- id: 53 -->
  description: "Real-time startup intelligence with logo integration and ecosystem analytics.",
};

// Task Statuses for Phase 4: Visual Enrichment & Analytics
// - [x] Capture and show startup logos <!-- id: 54 -->
// - [x] Remove Location fields from UI <!-- id: 55 -->
// - [x] Implement Refresh Intelligence progress bar <!-- id: 56 -->
// - [x] Implement Analytics dashboard (verticals/year) <!-- id: 57 -->
// - [ ] Final holistic verification <!-- id: 58 -->

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

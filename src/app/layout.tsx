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
  title: {
    default: "UST Course Compass - Visualize Your Academic Path",
    template: "%s | UST Course Compass",
  },
  description: "Explore and visualize UST course prerequisites and dependencies. Plan your academic journey with our interactive course relationship mapping tool.",
  keywords: ["UST", "course", "prerequisite", "visualization", "academic planning", "curriculum"],
  manifest: "/site.webmanifest",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    { rel: "icon", url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" },
    { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png", sizes: "192x192" },
    { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png", sizes: "512x512" },
  ],
};

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

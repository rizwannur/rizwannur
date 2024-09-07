import "./globals.css";
import { ReactNode } from "react";
import type { Metadata } from "next";
import { Syne } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"

const syne = Syne({
  subsets: ["latin"],
  display: "block",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Rizwan Nur — Frontend Engineer",
  description:
    "Fullstack Developer. Focused on interfaces and experiences, working remotely from Dhhaka, Bangladesh.",
  generator: "Next.js",
  applicationName: "Rizwan Nur",
  keywords: [
    "freelance",
    "developer",
    "freelance developer",
    "frontend",
    "react",
    "frontend developer",
    "frontend engineer",
    "creative",
    "creative developer",
    "creative engineer",
    "tech",
    "nigeria",
    "software",
    "software developer",
    "portfolio",
    "frontend developer portfolio",
    "creative developer portfolio",
  ],
  colorScheme: "dark",
  openGraph: {
    title: "Rizwan Nur — Fullstack Developer",
    description:
      "Fullstack Developer. Focused on interfaces and experiences, working remotely from Dhhaka, Bangladesh.",
    url: "https://www.rizwannur.xyz/",
    siteName: "www.rizwannur.xyz",
    images: [
      {
        url: "",
        width: 1200,
        height: 630,
        alt: "Rizwan Nur — Frontend Engineer",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rizwan Nur — Fullstack Developer",
    description:
      "Fullstack Developer. Focused on interfaces and experiences, working remotely from Dhhaka, Bangladesh.",
    creator: "rizwannur__",
    creatorId: "",
    images: [
      "",
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={`${syne.className} scroll-smooth scrollbar-thin scrollbar-track-[#0E1016] scrollbar-thumb-[#212531]`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

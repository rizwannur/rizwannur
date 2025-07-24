import type { Metadata } from "next";

export const siteMetadata: Metadata = {
  title: "Rizwan Nur — Full-Stack Developer & Digital Operator",
  description:
    "Full-Stack Developer and Digital Operator based in Dhaka, Bangladesh. I craft backend-first tools, CMS systems, and digital workflows. Currently co-managing Amader Health and preparing for university in Japan.",
  generator: "Next.js",
  applicationName: "Rizwan Nur",
  keywords: [
    "rizwan nur",
    "rafey",
    "freelance developer",
    "full-stack developer",
    "javascript",
    "next.js",
    "payload cms",
    "nodejs",
    "discord.js",
    "dhaka",
    "japan",
    "developer portfolio",
    "ecommerce backend",
    "digital operator",
    "student developer",
  ],
  openGraph: {
    title: "Rizwan Nur — Full-Stack Developer & Digital Operator",
    description:
      "Rizwan Nur builds systems that work — backend-first tooling, automated flows, and digital product backends. Based in Dhaka, building for a future in Japan.",
    url: "https://rizwannur.xyz",
    siteName: "rizwannur.xyz",
    images: [
      {
        url: "https://rizwannur.xyz/og-image.png", // Replace with your deployed OG image path
        width: 1200,
        height: 630,
        alt: "Rizwan Nur — Full-Stack Developer & Digital Operator",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rizwan Nur — Full-Stack Developer & Digital Operator",
    description:
      "Shipping real-world tools and preparing for tech education in Japan. Available for freelance and part-time collaboration.",
    creator: "@rafeydotdev", // Or update to "@rizwannur" if you switch handles
    images: [
      "https://rizwannur.xyz/og-image.png",
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

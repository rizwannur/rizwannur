import type { Metadata } from "next";

// --- Navbar Data ---
export const NAV_RESUME_URL = "https://docs.google.com/document/d/15W39xx3tRk7Cdbk690ODD9yLBJv9xZvq/edit?usp=sharing&ouid=103439662159800937701&rtpof=true&sd=true";
export const NAV_RESUME_ARIA_LABEL = "Open my resume";
export const NAV_RESUME_TOOLTIP = "View Resume";
export const NAV_LINKS = [
  { href: "#home", label: "Home", ariaLabel: "Scroll to Home Section" },
  { href: "#work", label: "Work", ariaLabel: "Scroll to Work Section" },
  { href: "#about", label: "About", ariaLabel: "Scroll to About Section" },
  { href: "#contact", label: "Contact", ariaLabel: "Scroll to Contact Section" }
];

// --- Footer Data ---
export const FOOTER_DESIGN_TEXT = "Adapted by";
export const FOOTER_DEVELOPER_URL = "https://github.com/rizwannur";
export const FOOTER_ARIA_LABEL = "Rafey's GitHub Profile";
export const FOOTER_DEVELOPER_NAME = "Rafey";

// --- Layout Metadata ---
export const SITE_METADATA: Metadata = {
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
    creator: "@rafeyum", // Or update to "@rizwannur" if you switch handles
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

import type { Metadata } from "next";

// --- Navbar Data ---
export const NAV_RESUME_URL =
  "https://docs.google.com/document/d/15W39xx3tRk7Cdbk690ODD9yLBJv9xZvq/edit?usp=sharing&ouid=103439662159800937701&rtpof=true&sd=true";
export const NAV_RESUME_ARIA_LABEL = "Open my resume";
export const NAV_RESUME_TOOLTIP = "View Resume";
export const NAV_LINKS = [
  { href: "/#home", label: "Home", ariaLabel: "Scroll to Home Section" },
  { href: "/#work", label: "Work", ariaLabel: "Scroll to Work Section" },
  { href: "/about", label: "About", ariaLabel: "Open About Page" },
  { href: "/#contact", label: "Contact", ariaLabel: "Scroll to Contact Section" },
];

// --- Footer Data ---
export const FOOTER_DESIGN_TEXT = "Built with ❤️ by";
export const FOOTER_DEVELOPER_URL = "https://github.com/rizwannur";
export const FOOTER_ARIA_LABEL = "Rafey's GitHub Profile";
export const FOOTER_DEVELOPER_NAME = "rafey";

// --- UI copy ---
export const UI_LOADING = "Loading tunes...";
export const UI_ERROR = "Failed to load songs from YouTube playlist.";
export const UI_NO_SONGS = "No songs found in the playlist.";
export const UI_SEND_EMAIL = "Send me an email";
export const UI_BOOK_CALL = "Book a call";
export const UI_BOOK_CALL_BUTTON = "BOOK A CALL";
export const UI_OR = "or";

// --- Layout Metadata ---
export const SITE_METADATA: Metadata = {
  metadataBase: new URL("https://rizwannur.com"),
  title: {
    default: "Rizwan Nur — AI-First Product Engineer & Creative Technologist",
    template: "%s | Rizwan Nur",
  },
  description:
    "I help businesses plan, build, and upgrade products with AI-first engineering, modern web systems, and brand-aware design. Next.js, TypeScript, Tauri, automation.",
  generator: "Next.js",
  applicationName: "Rizwan Nur",
  keywords: [
    "Rizwan Nur",
    "Rafey",
    "Creative Technologist",
    "Product Engineer",
    "AI Automation",
    "AI Tools",
    "Business Systems",
    "Brand Design",
    "Tauri Developer",
    "Next.js Developer",
    "Rust",
    "React",
    "Frontend Architecture",
    "UI/UX Engineering",
    "Web Development",
    "Desktop Apps",
    "TypeScript",
    "Interactive Design",
    "Motion Graphics",
  ],
  authors: [{ name: "Rizwan Nur", url: "https://rizwannur.com" }],
  creator: "Rizwan Nur",
  publisher: "Rizwan Nur",
  category: "Technology",
  colorScheme: "dark light",
  themeColor: "#0E1016",
  manifest: "/site.webmanifest",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  openGraph: {
    title: "Rizwan Nur — AI-First Product Engineer & Creative Technologist",
    description:
      "I help businesses plan, build, and upgrade products with AI-first engineering, modern web systems, and brand-aware design.",
    url: "/",
    siteName: "rizwannur.com",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Rizwan Nur — AI-First Product Engineer & Creative Technologist",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rizwan Nur — AI-First Product Engineer & Creative Technologist",
    description:
      "I help businesses plan, build, and upgrade products with AI-first engineering, modern web systems, and brand-aware design.",
    site: "@rafeyum",
    creator: "@rafeyum",
    images: ["/twitter-image"],
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicons/favicon.ico" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/favicons/apple-touch-icon.png", sizes: "180x180" }],
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
};

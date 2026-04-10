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
export const FOOTER_DESIGN_TEXT = "Built by";
export const FOOTER_DEVELOPER_URL = "https://github.com/rizwannur";
export const FOOTER_ARIA_LABEL = "Rafey's GitHub Profile";
export const FOOTER_DEVELOPER_NAME = "rafey";

export const UI_SEND_EMAIL = "Send the brief";
export const UI_BOOK_CALL = "Book a strategy call";
export const UI_BOOK_CALL_BUTTON = "BOOK A STRATEGY CALL";
export const UI_OR = "or";

// --- Layout Metadata ---
export const SITE_METADATA: Metadata = {
  metadataBase: new URL("https://rizwannur.com"),
  title: {
    default: "Rizwan Nur | Systems architect for scalable products",
    template: "%s | Rizwan Nur",
  },
  description:
    "I architect and deliver software systems across product strategy, frontend, backend, APIs, infrastructure, and execution. I help businesses launch software that is stable, scalable, and built to make money.",
  generator: "Next.js",
  applicationName: "Rizwan Nur",
  keywords: [
    "Rizwan Nur",
    "Rafey",
    "Systems Architect",
    "Software Architect",
    "Technical Lead",
    "Product Architecture",
    "Product Execution",
    "Scalable Systems",
    "Backend Systems",
    "API Design",
    "Platform Engineering",
    "AI Automation",
    "Business Systems",
    "Rust",
    "Go",
    "React",
    "Next.js",
    "TypeScript",
    "Frontend Architecture",
    "Desktop Apps",
    "Revenue Ready Software",
  ],
  authors: [{ name: "Rizwan Nur", url: "https://rizwannur.com" }],
  creator: "Rizwan Nur",
  publisher: "Rizwan Nur",
  category: "Technology",
  manifest: "/site.webmanifest",
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  openGraph: {
    title: "Rizwan Nur | Systems architect for scalable products",
    description:
      "Systems architecture, product execution, frontend, backend, and infrastructure for businesses that need software shipped properly.",
    url: "/",
    siteName: "rizwannur.com",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Rizwan Nur | Systems architect for scalable products",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rizwan Nur | Systems architect for scalable products",
    description:
      "I architect and deliver software systems for teams that need strong technical ownership from plan to production.",
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

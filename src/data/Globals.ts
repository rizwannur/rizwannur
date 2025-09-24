import type { Metadata } from "next";

// --- Navbar Data ---
export const NAV_RESUME_URL =
  "https://docs.google.com/document/d/15W39xx3tRk7Cdbk690ODD9yLBJv9xZvq/edit?usp=sharing&ouid=103439662159800937701&rtpof=true&sd=true";
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
  title: "Rizwan Nur — Full-Stack Developer & Tech Generalist",
  description:
    "Self-taught full-stack developer and tech generalist specializing in JavaScript, Python, and cloud-native applications. Passionate about building reliable, elegant systems with a bias toward automation and scale. Available for freelance projects.",
  generator: "Next.js",
  applicationName: "Rizwan Nur",
  keywords: [
    "Rizwan Nur",
    "Rafey",
    "full-stack developer",
    "freelance developer",
    "JavaScript developer",
    "Python developer",
    "React developer",
    "Node.js developer",
    "MongoDB developer",
    "API integration",
    "web development",
    "custom software",
    "automation specialist",
    "tech consultant",
    "remote developer",
    "Bangladesh developer",
    "cloud-native applications",
    "DevOps",
    "AI",
    "systems automation"
  ],
  authors: [{ name: "Rizwan Nur", url: "https://rizwannur.xyz" }],
  creator: "Rizwan Nur",
  publisher: "Rizwan Nur",
  category: "Technology",
 // colorScheme: "light dark",
 // themeColor: "#0f172a",
  openGraph: {
    title: "Rizwan Nur — Full-Stack Developer & Tech Generalist",
    description:
      "Self-taught full-stack developer and tech generalist specializing in JavaScript, Python, and cloud-native applications. Available for freelance projects.",
    url: "https://rizwannur.xyz",
    siteName: "rizwannur.xyz",
    images: [
      {
        url: "https://rizwannur.xyz/profile.png",
        width: 1200,
        height: 630,
        alt: "Rizwan Nur — Full-Stack Developer & Tech Generalist"
      }
    ],
    locale: "en-US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Rizwan Nur — Full-Stack Developer & Tech Generalist",
    description:
      "Self-taught full-stack developer specializing in JavaScript, Python, and cloud-native applications. Available for freelance projects.",
    creator: "@rafeyum",
    images: ["https://rizwannur.xyz/profile.png"]
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
      "max-snippet": -1
    }
  },
  metadataBase: new URL("https://rizwannur.xyz")
};

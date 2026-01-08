import { StaticImageData } from "next/image"; // Import if profileImage is a StaticImageData type

interface SocialLink {
  name: string;
  url: string;
  shortName: string;
}

interface HeroData {
  name: string;
  profileImage: string | StaticImageData; // Can be string for public path or StaticImageData for imported image
  backgroundImage?: string; // Optional if not always used
  tagline: string[];
  location: string;
  koraUrl: string;
  callUrl: string;
  socials: SocialLink[];
}

export const heroData: HeroData = {
  name: "RIZWAN NUR",
  profileImage: "/profile.png", // Hero headshot (in /public)
  backgroundImage: "/assets/hero.png", // Optional custom bg image
  tagline: [
    "Strategic Software Engineer & Creative Technologist.",
    "I help businesses ship high-performance products and AI workflows (Next.js + Tauri).",
    "From strategy to UI to automation—clean systems, crisp design, real outcomes.",
  ],
  location: "Remote developer based in Dhaka, Bangladesh — serving clients worldwide.",
  koraUrl: "", // Leave empty or replace with your most recent company or project site
  callUrl: "https://cal.com/rizwannur/30min", // Optional; update or remove if not used
  socials: [
    {
      name: "GitHub",
      url: "https://github.com/rizwannur",
      shortName: "GH",
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/rizwannur",
      shortName: "LN",
    },
    {
      name: "Twitter",
      url: "https://twitter.com/rileyizuku",
      shortName: "TW",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/rafeyum",
      shortName: "IG",
    },
    {
      name: "Blog",
      url: "https://blog.rizwannur.com",
      shortName: "PF",
    },
  ],
};

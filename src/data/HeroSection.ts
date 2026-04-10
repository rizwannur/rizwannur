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
  profileImage: "/hero-pfp.png", // Hero headshot (in /public)
  backgroundImage: "/assets/hero.png", // Optional custom bg image
  tagline: [
    "Systems architect for products that need to ship.",
    "I design the system, build the critical path, and keep delivery moving across frontend, backend, APIs, and infrastructure.",
    "I help teams get to production, hire well when needed, and hold the bar on quality until the product is ready to make money.",
  ],
  location:
    "Based in Dhaka, Bangladesh. Working remotely with teams that need strong technical ownership.",
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

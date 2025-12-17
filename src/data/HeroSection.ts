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
  profileImage: "/rafey.jpeg", // Hero headshot (in /public)
  backgroundImage: "/hero.jpg", // Optional custom bg image
  tagline: [
    "Full-Stack Developer & Tech Generalist.",
    "I build reliable, elegant systems with a focus on automation and scale.",
    "Available for freelance projects and custom software solutions.",
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
      url: "https://blog.rizwannur.xyz",
      shortName: "PF",
    },
  ],
};

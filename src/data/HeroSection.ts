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
  profileImage: "/profile.jpg", // Update path based on your file structure if needed
  backgroundImage: "/hero.jpg", // Optional custom bg image
  tagline: [
    "Full-Stack Developer & Digital Operator from Dhaka,",
    "co-running Digital Automate,",
    "prepping for Japan — available for freelance & collaborations.",
  ],
  location: "Building systems and brands remotely from Dhaka, Bangladesh.",
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

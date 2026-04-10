interface SocialLink {
    name: string;
    url: string;
    shortName: string;
  }
  
  interface ContactData {
    title: string;
    description: string;
    email: string;
    calendly: string;
    socials: SocialLink[];
  }
  
  export const contactData: ContactData = {
    title: "Let's Build",
    description:
      "If you need someone who can architect the system, own the technical direction, and help get the product to production, send over the brief. I can step in early, fix a messy middle, or help you close the last mile.",
    email: "rizwannur116@gmail.com", // Change if you'd prefer another address
    calendly: "https://cal.com/rizwannur/30min", // Optional — use your link or remove if not using
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
        name: "BLOG",
        url: "https://blog.rizwannur.com",
        shortName: "BG",
      },
    ],
  };
  
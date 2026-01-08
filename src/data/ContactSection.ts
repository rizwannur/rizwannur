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
    title: "Let's Connect",
    description:
      "Have a product to build, a brand to refine, or a business process to automate with AI? Tell me what you’re aiming for—I’ll help you get there.",
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
  
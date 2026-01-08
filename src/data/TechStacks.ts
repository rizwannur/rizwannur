interface TechStackLink {
  name: string;
  href: string;
}

interface TechStacksData {
  title: string;
  description: string;
  stacks: TechStackLink[];
}

export const techStacksData: TechStacksData = {
  title: "Tech Stacks",
  description:
    "Technologies and tools I use to build modern, high-performance applications",
  stacks: [
    { name: "Next.js", href: "https://nextjs.org" },
    { name: "React", href: "https://react.dev" },
    { name: "TypeScript", href: "https://www.typescriptlang.org" },
    { name: "Tauri", href: "https://tauri.app" },
    { name: "Rust", href: "https://www.rust-lang.org" },
    { name: "Tailwind CSS", href: "https://tailwindcss.com" },
    { name: "Supabase", href: "https://supabase.com" },
    { name: "Vercel", href: "https://vercel.com" },
    { name: "Node.js", href: "https://nodejs.org" },
    { name: "Framer Motion", href: "https://www.framer.com/motion" },
    { name: "GSAP", href: "https://greensock.com/gsap" },
    { name: "Figma", href: "https://www.figma.com" },
  ],
};


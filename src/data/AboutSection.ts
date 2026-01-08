interface SkillCategory {
    title: string;
    description: string;
  }
  
  interface Skills {
    frontendTools: SkillCategory;
    uiLibraries: SkillCategory;
    designTools: SkillCategory;
  }
  
  interface AboutData {
    mainTitle: string;
    description: string[];
    skills: Skills;
    musicSectionText: string;
  }
  
  export const aboutData: AboutData = {
    mainTitle: "I help businesses grow with AI-first product engineering.",
    description: [
      "I work with founders and teams to turn messy ideas into clear roadmaps, clean systems, and products that customers actually enjoy using.",
      "My edge is the blend: product strategy + engineering + design. I build fast, scalable apps (Next.js/TypeScript) and ship desktop experiences with Tauri—while keeping the UX sharp and the codebase maintainable.",
      "I’m also strong with applied AI: automations, internal tools, and workflow upgrades that save time, reduce overhead, and help you reach your next growth milestone."
    ],
    skills: {
      frontendTools: {
        title: "The Toolkit",
        description:
          "Next.js, Tauri (Desktop), TypeScript, React, Rust (Basic), Supabase, Vercel, Node.js."
      },
      uiLibraries: {
        title: "Aesthetics",
        description:
          "Framer Motion, Tailwind CSS, GSAP, Shadcn/ui, Canvas/WebGL, CSS Modules."
      },
      designTools: {
        title: "Creative",
        description:
          "Figma, Rive, Adobe suite, UI/UX Strategy, Prototyping, Brand Identity."
      }
    },
    musicSectionText:
      "Late night commits are powered by lo-fi beats, ambient jazz, and heavy doses of caffeine."
  };
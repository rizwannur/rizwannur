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
    mainTitle: "I build reliable, elegant systems with a focus on automation and scale.",
    description: [
      "I'm a self-taught full-stack developer and tech generalist passionate about building reliable, elegant systems. I specialize in JavaScript, Python, and cloud-native applications with a bias toward automation and scale.",
      "With a history of remote freelance work, real-world projects, and open-source contributions, I blend creativity with engineering discipline to craft meaningful tech solutions.",
      "I'm actively seeking long-term freelance opportunities. Let’s build something lean, sharp, and timeless together."
    ],
    skills: {
      frontendTools: {
        title: "Frontend",
        description: "HTML5, CSS3, JavaScript (ES6+), React, Next.js, Tailwind CSS, Bootstrap, NextAuth, Formik, Git/GitHub."
      },
      uiLibraries: {
        title: "UI Libraries",
        description: "Material UI, Framer Motion, Lucide Icons, DaisyUI, Chart.js, GSAP (learning)."
      },
      designTools: {
        title: "Design Tools",
        description: "Affinity Photo 2, Figma, Canva, Adobe Photoshop (basic), Product Mockups, UI Layout, Color Theory, Typography."
      }
    },
    musicSectionText: "When I'm working late or thinking deeply, you'll find me looping RnB, lo-fi beats, and old anime OSTs. Ask me for a playlist anytime."
  };
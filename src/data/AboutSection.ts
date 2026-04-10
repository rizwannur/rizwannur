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
  }
  
  export const aboutData: AboutData = {
    mainTitle: "I architect systems that ship and scale.",
    description: [
      "Most teams do not need another pair of hands. They need someone who can see the whole system, make the hard technical calls, and keep the build moving. That is the work I like.",
      "I work across product architecture, backend systems, frontend delivery, APIs, databases, and infrastructure. I design the system, build the critical parts, and make sure the pieces fit before they turn into expensive problems.",
      "When a project needs more than one builder, I can help shape the team, review the work, and hold the bar on quality. The goal is simple: get to production with software that is stable, scalable, and useful to the business."
    ],
    skills: {
      frontendTools: {
        title: "Architecture",
        description:
          "System design, backend services, APIs, databases, infrastructure, Go, Rust, TypeScript, and Next.js."
      },
      uiLibraries: {
        title: "Delivery",
        description:
          "Frontend systems, dashboards, internal tools, workflow automation, and the work needed to get a product safely into production."
      },
      designTools: {
        title: "Leadership",
        description:
          "Technical direction, hiring support, code review, quality control, execution planning, and launch oversight."
      }
    }
  };
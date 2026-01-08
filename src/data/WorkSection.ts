import { DevProject } from "../lib/types";
import psycheConnectImage from "../../public/projects/psyche-connect.png";
import financialCrmImage from "../../public/projects/financial-crm.png";
import roofingManagementImage from "../../public/projects/roofing.png";
import aiBusinessChatImage from "../../public/projects/aura.png";

export const projectsTitle = "Featured Work";
export const sectionHeading = "Selected Artifacts.";
export const sectionDescription =
  "A curated gallery of digital experiences where engineering meets aesthetic precision.";
export const viewCollectionsButton = "VIEW COLLECTIONS";
export const dialogTitle = "Our Archive";
export const dialogDescription =
  "A deep dive into my professional journey across full-stack development, AI automation, and interactive design.";

const projectImages = [
  psycheConnectImage,
  financialCrmImage,
  roofingManagementImage,
  aiBusinessChatImage,
];

/**
 * Development projects data
 */
export const devProjects: DevProject[] = [
  {
    id: 0,
    name: "PsycheConnect",
    description:
      "A multi-role mental health SaaS with scheduling, availability management, and client charts. Produced UX fixes from real therapist feedback.",
    technologies: [
      "Next.js",
      "Tailwind CSS",
      "Role-based Auth",
      "Scheduling Engine",
    ],
    github: "https://github.com/rizwannur",
    demo: "https://www.psychlink.pro/",
    image: projectImages[0],
    available: true,
  },
  {
    id: 2,
    name: "Financial CRM",
    description:
      "Internal business tool for deal management, pipeline tracking, and compliance-ready dashboards.",
    technologies: ["Next.js", "TypeScript", "Modular API", "Data Viz"],
    github: "https://github.com/rizwannur",
    demo: "https://trustedfinancing.ca/",
    image: projectImages[1],
    available: true,
  },
  {
    id: 3,
    name: "Roofing Management",
    description:
      "Vertical SaaS for roofing contractors with lead intake, job estimates, and project tracking optimized for field use.",
    technologies: ["React", "Node.js", "Project Tracking", "Estimate Engine"],
    github: "https://github.com/rizwannur",
    demo: "",
    image: projectImages[2],
    available: false,
  },
  {
    id: 4,
    name: "AI Business Chat",
    description:
      "AI-powered internal productivity layer focused on context-aware operations and knowledge retrieval.",
    technologies: ["AI Ops", "Chat Engine", "Knowledge RAG", "Productivity Tech"],
    github: "https://github.com/rizwannur",
    demo: "",
    image: projectImages[3],
    available: false,
  },
];

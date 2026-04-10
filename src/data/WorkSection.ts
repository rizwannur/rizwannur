import { DevProject } from "../lib/types";
import psychlinkLiveImage from "../../public/projects/psychlink-live.png";
import storyXenLiveImage from "../../public/projects/storyxen-live.png";
import trustedFinancingLiveImage from "../../public/projects/trusted-financing-live.png";
import roofAiLiveImage from "../../public/projects/roofai-live.png";
import auraaLiveImage from "../../public/projects/auraa-live.png";

export const projectsTitle = "Client Systems";
export const sectionHeading = "Built to ship.";
export const sectionDescription =
  "A selection of client systems I architected, built, or pushed through launch. Different industries, same job: make the software work in the real world.";
export const viewCollectionsButton = "VIEW CLIENT WORK";
export const dialogTitle = "Selected systems";
export const dialogDescription =
  "A closer look at the systems, product decisions, and delivery work behind my client projects.";

const projectImages = [
  storyXenLiveImage,
  trustedFinancingLiveImage,
  psychlinkLiveImage,
  roofAiLiveImage,
  auraaLiveImage,
];

/**
 * Development projects data
 */
export const devProjects: DevProject[] = [
  {
    id: 0,
    name: "StoryXen",
    description:
      "Production planning software for independent film teams, turning scripts into breakdowns, schedules, budgets, compliance, and investor-ready reporting in one system.",
    technologies: [
      "Production Planning",
      "Script Breakdown",
      "Budgeting",
      "Investor Reporting",
    ],
    github: "https://github.com/rizwannur",
    demo: "https://storyxen.com/",
    image: projectImages[0],
    available: true,
    youtubeId: "zs9pwX58VVQ",
  },
  {
    id: 1,
    name: "Trusted Financing",
    description:
      "Private business financing platform with deal workflow, banking-link verification via Flinks, and Bankgrade app integration for underwriting readiness.",
    technologies: ["Next.js", "TypeScript", "Flinks API", "Bankgrade Integration"],
    github: "https://github.com/rizwannur",
    demo: "https://trustedfinancing.ca/",
    image: projectImages[1],
    available: true,
  },
  {
    id: 2,
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
    image: projectImages[2],
    available: true,
  },
  {
    id: 3,
    name: "RoofAI",
    description:
      "AI-powered roofing operating system for contractors, combining estimates, crew workflows, job tracking, and profitability management in one dashboard.",
    technologies: ["Roofing SaaS", "AI Voice Assistant", "Estimate Engine", "Crew Ops"],
    github: "https://github.com/rizwannur",
    demo: "https://roofai.pro/",
    image: projectImages[3],
    available: true,
  },
  {
    id: 4,
    name: "Auraa",
    description:
      "Business AI for founders and operators, built to analyze markets, draft strategic artifacts, and optimize decisions with executive-level reasoning.",
    technologies: ["Executive AI", "Strategy Artifacts", "Market Research", "Financial Modeling"],
    github: "https://github.com/rizwannur",
    demo: "https://auraa.business/",
    image: projectImages[4],
    available: true,
  },
];

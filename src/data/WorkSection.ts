export const projectsTitle = "Featured Work";

import { DevProject, DesignProject } from "../lib/types";
import synthetixImage from "../../public/projects/synthetix-flip.png";
import propellentImage from "../../public/projects/propellent-new.png";
import flixifyImage from "../../public/projects/flixify.png";
/**
 * Development projects data
 */
export const devProjects: DevProject[] = [
  {
    id: 0,
    name: "Cinesync",
    description:
      "AI-powered YouTube film automation tool. Built an end-to-end automation pipeline for YouTube content around movie recommendations.",
    technologies: ["Python", "OpenAI", "MoviePy", "FFmpeg", "Flask", "TMDB API", "Cron"],
    github: "https://github.com/rizwannur",
    demo: "",
    image: synthetixImage,
    available: true,
  },
  {
    id: 1,
    name: "ThriftwearCMS",
    description:
      "Custom Payload CMS for fashion e-commerce. Built a full-featured backend with user roles, product management, and secure order tracking.",
    technologies: ["Node.js", "React", "TypeScript", "MongoDB", "Payload CMS", "Stripe API"],
    github: "https://github.com/rizwannur",
    demo: "",
    image: propellentImage,
    available: true,
  },
  {
    id: 2,
    name: "rimuru",
    description:
      "Discord music & utility bot. Developed a multi-source music bot with server-level customization, logging, and moderation.",
    technologies: ["Discord.js", "DisTube", "Node.js", "PM2", "Linux VPS"],
    github: "https://github.com/rizwannur",
    demo: "",
    image: flixifyImage,
    available: true,
  },
  {
    id: 3,
    name: "Fluxcast",
    description:
      "A live streaming SaaS platform with voice cloning capabilities, using the ElevenLabs API.",
    technologies: ["Next.js", "TypeScript", "Node.js", "ElevenLabs API"],
    github: "https://github.com/rizwannur",
    demo: "",
    image: synthetixImage,
    available: true,
  },
];

/**
 * Design projects data
 */
export const designProjects: DesignProject[] = [
  {
    id: 1,
    name: "Hebron Statup Lab Website",
    description:
      "SkyWatch is a convenient and user-friendly tool that allows you to quickly and easily check the current.",
    technologies: ["UX Research", "UI Design", "Prototyping"],
    github: "",
    demo: "",
    image: "/_next/image?url=%2F..%2Fpublic%2Fprojects%2Fhsl.webp&w=1920&q=75",
    available: false,
  },
  {
    id: 2,
    name: "RAGS Scrubs Website",
    description:
      "An image generator website that allows users to generate, combine, and download images.",
    technologies: ["UX Research", "UI Design", "Prototyping"],
    github: "",
    demo: "",
    image: "/_next/image?url=%2F..%2Fpublic%2Fprojects%2Frags.webp&w=1920&q=75",
    available: false,
  },
  {
    id: 3,
    name: "Crown Branding Agency Website",
    description:
      "A website that reduces the length of your URL using Bit.ly's API",
    technologies: ["UX Research", "UI Design", "Prototyping"],
    github: "",
    demo: "",
    image:
      "/_next/image?url=%2F..%2Fpublic%2Fprojects%2Fcrown.webp&w=1920&q=75",
    available: false,
  },
  {
    id: 4,
    name: "Titi Mobile App",
    description:
      "TMTM helps you find people who are headed to the same location as you, so you can share a ride and split the cost with them.",
    technologies: ["UX Research", "UI Design", "Prototyping"],
    github: "",
    demo: "",
    image: "/_next/image?url=%2F..%2Fpublic%2Fprojects%2Ftiti.webp&w=1920&q=75",
    available: false,
  },
];

/**
 * Type guard to check if a project is a DevProject
 */
export function isDevProject(
  project: DevProject | DesignProject
): project is DevProject {
  return project.available === true;
}

/**
 * Type guard to check if a project is a DesignProject
 */
export function isDesignProject(
  project: DevProject | DesignProject
): project is DesignProject {
  return project.available === false;
}

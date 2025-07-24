import { DevProject, DesignProject } from "../lib/types";
import odunsiImage from "../../public/projects/odunsi.png";
import interlockImage from "../../public/projects/interlock.png";
import synthetixImage from "../../public/projects/synthetix-flip.png";
import propellentImage from "../../public/projects/propellent-new.png";
import flixifyImage from "../../public/projects/flixify.png";

/**
 * Development projects data
 */
export const devProjects: DevProject[] = [
  {
    id: 0,
    name: "Odunsi",
    description:
      "Portfolio website for Michael Odunsi, an experienced UI/UX designer crafting unique, user-friendly products and web experiences for Web3 founders and projects.",
    technologies: ["React", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/victorcodess/odunsi-web3-folio",
    demo: "https://www.odunsi.xyz/",
    image: odunsiImage,
    available: true,
  },
  {
    id: 1,
    name: "Interlock",
    description:
      "This is a website for a Fintech Startup to showcase their innovative solutions tailored to meet the evolving needs of their clients.",
    technologies: ["React", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/victorcodess/interlock",
    demo: "https://interlock-teal.vercel.app/",
    image: interlockImage,
    available: true,
  },
  {
    id: 2,
    name: "Synthetix",
    description:
      "Built specifically for an AI startup, this website lets them present cutting-edge AI data processing solutions tailored to their customers' needs.",
    technologies: ["React", "Next.js", "Prismic CMS"],
    github: "https://github.com/victorcodess/synthetix",
    demo: "https://synthetix-iota.vercel.app/",
    image: synthetixImage,
    available: true,
  },
  {
    id: 3,
    name: "Propellent",
    description:
      "A website built for a software startup and small business, to showcase their services and mark their online presence.",
    technologies: ["React", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/victorcodess/propellent",
    demo: "https://propellent.vercel.app/",
    image: propellentImage,
    available: true,
  },
  {
    id: 4,
    name: "Flixify",
    description:
      "Flixify lets you seamlessly explore movies and TV series, add bookmarks, and search across all pages. It offers user authentication along with a theme switch.",
    technologies: ["Next.js", "Typescript", "Prisma"],
    github: "https://github.com/victorcodess/flixify",
    demo: "https://flixify.victorwilliams.me/",
    image: flixifyImage,
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

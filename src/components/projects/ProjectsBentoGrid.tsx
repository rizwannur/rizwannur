"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { DevProject } from "@/lib/types";

type Props = {
  projects: DevProject[];
  className?: string;
  tileWidth?: number; // px base width for small screens
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function tileSpan(index: number) {
  // 12-col bento: big hero tile + supporting tiles + a wide finisher
  switch (index) {
    case 0:
      return "lg:col-span-7 lg:row-span-6";
    case 1:
      return "lg:col-span-5 lg:row-span-3";
    case 2:
      return "lg:col-span-5 lg:row-span-3";
    case 3:
      return "lg:col-span-7 lg:row-span-4";
    case 4:
      return "lg:col-span-12 lg:row-span-3";
    default:
      return "lg:col-span-6 lg:row-span-3";
  }
}

export default function ProjectsBentoGrid({
  projects,
  className = "",
  tileWidth = 320,
}: Props) {
  return (
    <motion.div
      className={`relative ${className}`}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0E1016] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0E1016] to-transparent" />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12 lg:auto-rows-[68px]">
        {projects.map((project, index) => {
          const href = project.demo || project.github || "/projects";
          const external = href.startsWith("http");

          return (
            <motion.div
              key={project.id}
              variants={item}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={tileSpan(index)}
            >
              <Link
                href={href}
                target={external ? "_blank" : undefined}
                aria-label={`Open ${project.name}`}
                className={[
                  "group relative block h-full overflow-hidden rounded-[28px] border border-[#212531]",
                  "bg-[#0b0d13]/55 shadow-[0_18px_70px_rgba(0,0,0,0.55)] backdrop-blur-sm",
                  "min-h-[220px] sm:min-h-[260px] lg:min-h-0",
                ].join(" ")}
                style={{
                  // Helps keep tiles “perfect” on smaller screens
                  width: "100%",
                  maxWidth: index === 0 ? "none" : undefined,
                }}
              >
                <div
                  className="relative h-full w-full"
                  style={{ minWidth: index < 2 ? tileWidth : undefined }}
                >
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 60vw"
                    priority={index < 2}
                  />

                  {/* highlight/lighting */}
                  <div className="pointer-events-none absolute inset-0 opacity-70 mix-blend-soft-light">
                    <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-violet-300/15 blur-3xl" />
                  </div>

                  {/* overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1016]/92 via-[#0E1016]/25 to-transparent opacity-85 transition-opacity duration-300 group-hover:opacity-95" />

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#e4ded7]/70">
                      {project.technologies[0]}
                    </p>
                    <h3 className="mt-1 text-2xl font-bold tracking-tight text-[#e4ded7] md:text-3xl">
                      {project.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm font-medium text-[#e4ded7]/75">
                      {project.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}


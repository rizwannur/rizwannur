import Image from "next/image";
import Link from "next/link";
import type { DevProject } from "@/lib/types";

type Props = {
  projects: DevProject[];
  className?: string;
  /** Seconds for a full loop */
  durationSeconds?: number;
};

function padTo<T>(arr: T[], minItems: number): T[] {
  if (arr.length === 0) return [];
  const out = [...arr];
  while (out.length < minItems) out.push(...arr);
  return out.slice(0, minItems);
}

export default function ProjectsMarquee({
  projects,
  className = "",
  durationSeconds = 26,
}: Props) {
  const row = padTo(projects, 10);

  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#0E1016] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#0E1016] to-transparent" />

      <div
        className="marquee marquee-reverse [--marquee-delay:-10s]"
        style={{ ["--marquee-duration" as any]: `${durationSeconds}s` }}
      >
        <div className="marquee-track gap-6 py-2">
          {[...row, ...row].map((project, index) => {
            const href = project.demo || "/work";
            const external = href.startsWith("http");

            return (
              <Link
                key={`${project.id}-${index}`}
                href={href}
                target={external ? "_blank" : undefined}
                aria-label={`Open ${project.name}`}
                className={[
                  "group relative h-[220px] w-[360px] shrink-0 overflow-hidden rounded-[28px] sm:h-[260px] sm:w-[460px] lg:h-[320px] lg:w-[560px]",
                  "border border-[#212531] bg-[#0b0d13]/55 shadow-[0_18px_70px_rgba(0,0,0,0.55)] backdrop-blur-sm",
                ].join(" ")}
              >
                <Image
                  src={project.image}
                  alt={project.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 360px, (max-width: 1024px) 460px, 560px"
                  priority={index < 2}
                />

                {/* subtle highlight */}
                <div className="pointer-events-none absolute inset-0 opacity-70 mix-blend-soft-light">
                  <div className="absolute -top-16 -left-16 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />
                  <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-violet-300/15 blur-3xl" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1016]/92 via-[#0E1016]/25 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95" />

                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <span className="rounded-full border border-[#e4ded7]/20 bg-[#0E1016]/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#e4ded7] backdrop-blur-sm">
                    {project.technologies[0]}
                  </span>
                  {project.demo ? (
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
                      Live
                    </span>
                  ) : (
                    <span className="rounded-full border border-[#e4ded7]/15 bg-[#0E1016]/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#e4ded7]/70">
                      Private
                    </span>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="text-2xl font-bold tracking-tight text-[#e4ded7] lg:text-3xl">
                    {project.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm font-medium text-[#e4ded7]/75">
                    {project.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}


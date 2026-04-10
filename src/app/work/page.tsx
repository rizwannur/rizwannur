import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { devProjects } from "@/data/WorkSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Lock, Pin } from "lucide-react";

export const metadata: Metadata = {
  title: "Work | Client systems",
  description:
    "A selection of client systems across finance, health, operations, and AI. Private repos stay private. Public demos are linked where clients allow it.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <main className="relative z-10 min-h-screen bg-[#0E1016] pt-16 pb-24 text-[#e4ded7]">
      <div className="mx-auto w-[90%] max-w-[1440px]">
        <div className="mb-10 flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#e4ded7]/70">
            Client systems
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Systems built for real businesses.
          </h1>
          <p className="max-w-[900px] text-base font-medium text-[#e4ded7]/80 md:text-lg">
            These projects had real constraints, deadlines, users, and revenue
            goals. Repositories stay private. Public demos are shared only when
            clients allow it.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_420px]">
          {/* Feed */}
          <section className="mx-auto w-full max-w-[760px]">
            <div className="flex flex-col gap-4">
              {devProjects.map((p, idx) => {
                const hasLive = Boolean(p.demo);

                return (
                  <article
                    key={p.id}
                    className="group rounded-2xl border border-[#212531] bg-[#0b0d13]/60 backdrop-blur-sm transition-colors hover:bg-[#0b0d13]/75"
                  >
                    <div className="flex gap-4 p-5">
                      <div className="flex w-10 flex-col items-center">
                        <Image
                          src="/profile.png"
                          alt="Rizwan Nur"
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="mt-2 h-full w-px bg-[#212531]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <p className="font-semibold text-[#e4ded7]">
                                Rizwan Nur
                              </p>
                              <p className="text-sm text-[#e4ded7]/60">
                                @rizwannur · Client project
                              </p>
                              {idx === 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#e4ded7]/70">
                                  <Pin className="h-3.5 w-3.5" />
                                  Pinned
                                </span>
                              )}
                            </div>
                            <h2 className="mt-1 text-xl font-bold tracking-tight text-[#e4ded7] md:text-2xl">
                              {p.name}
                            </h2>
                          </div>

                          <span className="inline-flex items-center gap-2 rounded-full border border-[#212531] px-3 py-1 text-xs font-semibold text-[#e4ded7]/70">
                            <span className="h-2 w-2 rounded-full bg-[#e4ded7]/35" />
                            Private repo
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-medium leading-relaxed text-[#e4ded7]/80 md:text-base">
                          {p.description}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {p.technologies.map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="border border-[#212531] bg-[#212531]/40 text-[#e4ded7]"
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>

                        <div className="mt-4 overflow-hidden rounded-xl border border-[#212531]">
                          {p.youtubeId ? (
                            <div className="relative aspect-video w-full">
                              <iframe
                                src={`https://www.youtube-nocookie.com/embed/${p.youtubeId}?rel=0&modestbranding=1`}
                                title={`${p.name} demo video`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 h-full w-full"
                              />
                            </div>
                          ) : (
                            <div className="relative aspect-[16/10]">
                              <Image
                                src={p.image}
                                alt={`${p.name} screenshot`}
                                fill
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                                sizes="(max-width: 768px) 90vw, 760px"
                                priority={p.id < 2}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0E1016]/55 via-transparent to-transparent" />
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              asChild
                              variant="outline"
                              disabled={!p.demo}
                              className="h-9 border-[#e4ded7]/20 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10 disabled:pointer-events-none disabled:opacity-40"
                            >
                              <Link
                                href={p.demo || "#"}
                                target="_blank"
                                aria-label="Open live demo"
                              >
                                <span className="flex items-center gap-2">
                                  <ExternalLink className="h-4 w-4" />
                                  Live demo
                                </span>
                              </Link>
                            </Button>

                            <Button
                              asChild
                              variant="outline"
                              className="h-9 border-[#e4ded7]/20 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10"
                            >
                              <Link
                                href="https://cal.com/rizwannur/30min"
                                target="_blank"
                                aria-label="Book a strategy call"
                              >
                                Book a strategy call
                              </Link>
                            </Button>
                          </div>

                          {!hasLive && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#e4ded7]/60">
                              <Lock className="h-3.5 w-3.5" />
                              Demo available on request
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <div className="rounded-2xl border border-[#212531] bg-[#0b0d13]/60 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#e4ded7]/70">
                  Notes
                </p>
                <p className="mt-3 text-sm font-medium leading-relaxed text-[#e4ded7]/75">
                  Most client systems include private code, internal workflows,
                  or sensitive data. If you want the architecture or delivery
                  breakdown, ask for a case study.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-4 w-full border-[#e4ded7]/20 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10"
                >
                  <Link
                    href="mailto:rizwannur116@gmail.com?subject=Case%20study%20request"
                    aria-label="Request a case study"
                  >
                    Request a case study
                  </Link>
                </Button>
              </div>

              <div className="rounded-2xl border border-[#212531] bg-[#0b0d13]/60 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#e4ded7]/70">
                  Jump back
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-4 w-full border-[#e4ded7]/20 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10"
                >
                  <Link href="/#work" aria-label="Back to home">
                    ← Back to home
                  </Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-12 lg:hidden">
          <Button
            asChild
            variant="ghost"
            className="px-0 text-[#e4ded7]/80 hover:bg-transparent hover:text-[#e4ded7]"
          >
            <Link href="/#work" aria-label="Back to home">
              ← Back to home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}


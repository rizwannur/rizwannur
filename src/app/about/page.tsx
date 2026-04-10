import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  Mail,
  Phone,
  ShieldCheck,
  Languages as LanguagesIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About — Rizwan Nur",
  description:
    "Systems architect working across product architecture, frontend, backend, APIs, infrastructure, and delivery. I help teams ship software that is built to hold up in production.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="relative z-10 min-h-screen bg-[#0E1016] pt-16 pb-24 text-[#e4ded7]">
      <div className="mx-auto w-[90%] max-w-[1440px]">
        {/* Header */}
        <header className="mb-12 grid gap-8 lg:grid-cols-[1fr_420px]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[#e4ded7]/70">
              About
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
              Rizwan Nur
            </h1>
            <p className="mt-3 text-base font-semibold text-[#e4ded7]/85 md:text-lg">
              Systems architect · product execution lead
            </p>
            <p className="mt-6 max-w-[820px] text-base font-medium leading-relaxed text-[#e4ded7]/80 md:text-lg">
              I work with founders and teams that need someone to own the
              system, not just a ticket queue. That means architecture,
              delivery planning, frontend, backend, APIs, infrastructure, and
              the technical judgment that keeps a product moving toward
              production.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {[
                "Systems architecture",
                "Product execution",
                "AI automation",
                "Go",
                "Rust",
                "Next.js",
                "Technical leadership",
              ].map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="border border-[#212531] bg-[#212531]/40 text-[#e4ded7]"
                >
                  {t}
                </Badge>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              <Button
                asChild
                variant="outline"
                className="border-[#e4ded7]/20 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10"
              >
                <Link href="/work" aria-label="View client work">
                  View work
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[#e4ded7]/20 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10"
              >
                <Link href="/#contact" aria-label="Go to contact section">
                  Contact
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-[#22d3ee]/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/15"
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
          </div>

          {/* Contact card */}
          <aside className="rounded-2xl border border-[#212531] bg-[#0b0d13]/60 p-6 backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#e4ded7]/70">
              Contact
            </p>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="mailto:rizwannur116@gmail.com"
                className="flex items-center gap-2 rounded-xl border border-[#212531] bg-[#212531]/25 px-3 py-2 text-sm font-semibold text-[#e4ded7] hover:bg-[#212531]/40"
                aria-label="Email Rizwan Nur"
              >
                <Mail className="h-4 w-4" />
                rizwannur116@gmail.com
              </Link>

              <Link
                href="tel:+8801534593563"
                className="flex items-center gap-2 rounded-xl border border-[#212531] bg-[#212531]/25 px-3 py-2 text-sm font-semibold text-[#e4ded7] hover:bg-[#212531]/40"
                aria-label="Call Rizwan Nur"
              >
                <Phone className="h-4 w-4" />
                +8801534593563
              </Link>

              <Link
                href="https://rizwannur.com"
                target="_blank"
                className="flex items-center gap-2 rounded-xl border border-[#212531] bg-[#212531]/25 px-3 py-2 text-sm font-semibold text-[#e4ded7] hover:bg-[#212531]/40"
                aria-label="Open website"
              >
                <LinkIcon className="h-4 w-4" />
                rizwannur.com
              </Link>

              <Link
                href="https://blog.rizwannur.com"
                target="_blank"
                className="flex items-center gap-2 rounded-xl border border-[#212531] bg-[#212531]/25 px-3 py-2 text-sm font-semibold text-[#e4ded7] hover:bg-[#212531]/40"
                aria-label="Open blog"
              >
                <LinkIcon className="h-4 w-4" />
                blog.rizwannur.com
              </Link>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="border-[#e4ded7]/20 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10"
                >
                  <Link
                    href="https://linkedin.com/in/rizwannur"
                    target="_blank"
                    aria-label="Open LinkedIn"
                  >
                    LinkedIn
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-[#e4ded7]/20 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10"
                >
                  <Link
                    href="https://github.com/rizwannur"
                    target="_blank"
                    aria-label="Open GitHub"
                  >
                    GitHub
                  </Link>
                </Button>
              </div>

              <Button
                asChild
                variant="outline"
                className="mt-2 border-[#e4ded7]/20 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10"
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
          </aside>
        </header>

        {/* Guided flow */}
        <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_420px]">
          <section className="rounded-2xl border border-[#212531] bg-[#0b0d13]/60 p-6 backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#e4ded7]/70">
              How I work
            </p>
            <ol className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                {
                  title: "Scope",
                  body: "Define the business goal, constraints, risk, and what the first real version has to do.",
                },
                {
                  title: "Architecture",
                  body: "Choose the system shape, data model, stack, and delivery path.",
                },
                {
                  title: "Execution",
                  body: "Build the critical path, review work, and keep quality from drifting.",
                },
                {
                  title: "Launch",
                  body: "Ship to production, watch the system, and clean up what real usage exposes.",
                },
              ].map((s, i) => (
                <li
                  key={s.title}
                  className="rounded-xl border border-[#212531] bg-[#212531]/25 p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#e4ded7]/60">
                    Step {i + 1}
                  </p>
                  <p className="mt-1 font-semibold text-[#e4ded7]">{s.title}</p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-[#e4ded7]/75">
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-[#212531] bg-[#0b0d13]/60 p-6 backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#e4ded7]/70">
              Good fit if you need
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm font-medium text-[#e4ded7]/80">
              <li>A product that needs architecture before more code gets written.</li>
              <li>A system that has to scale without turning into a maintenance mess.</li>
              <li>Technical leadership across frontend, backend, APIs, and infrastructure.</li>
              <li>A builder who can step in, ship, and hold the line on quality.</li>
            </ul>
            <div className="mt-5 rounded-xl border border-[#212531] bg-[#212531]/25 p-4">
              <p className="text-sm font-medium text-[#e4ded7]/75">
                Send a short brief with the goal, timeline, and constraints. I
                will tell you where I would start and what I would avoid.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-4 w-full border-[#e4ded7]/20 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10"
              >
                <Link
                  href="mailto:rizwannur116@gmail.com?subject=Project%20brief"
                  aria-label="Email a project brief"
                >
                  Send the brief
                </Link>
              </Button>
            </div>
          </section>
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Core skills */}
          <section className="rounded-2xl border border-[#212531] bg-[#0b0d13]/60 p-6 backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#e4ded7]/70">
              Core skills
            </p>
            <div className="mt-5 space-y-4 text-sm font-medium leading-relaxed text-[#e4ded7]/80">
              <div>
                <p className="font-semibold text-[#e4ded7]">Architecture & delivery</p>
                <p className="text-[#e4ded7]/75">
                  System design, product scoping, delivery planning, documentation,
                  and technical decision making.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#e4ded7]">AI & automation</p>
                <p className="text-[#e4ded7]/75">
                  Workflow automation, internal tools, API integrations, data
                  pipelines, and applied AI where it is actually useful.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#e4ded7]">Engineering</p>
                <p className="text-[#e4ded7]/75">
                  Next.js, React, TypeScript, Node.js, Go, Rust, REST, Supabase,
                  Postgres, auth, performance, and DX.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#e4ded7]">Technical leadership</p>
                <p className="text-[#e4ded7]/75">
                  Hiring support, code review, quality control, execution
                  oversight, and keeping teams aligned on the same system.
                </p>
              </div>
            </div>
          </section>

          {/* Tech stack */}
          <section className="rounded-2xl border border-[#212531] bg-[#0b0d13]/60 p-6 backdrop-blur-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#e4ded7]/70">
              Tech stack
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "Next.js",
                "React",
                "TypeScript",
                "Node.js",
                "Tailwind CSS",
                "Tauri",
                "Supabase",
                "Postgres",
                "MongoDB",
                "Redis",
                "Vercel",
                "Cloudflare",
                "Git",
              ].map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="border border-[#212531] bg-[#212531]/40 text-[#e4ded7]"
                >
                  {t}
                </Badge>
              ))}
            </div>
            <p className="mt-4 text-sm font-medium text-[#e4ded7]/70">
              I choose tools based on constraints, risk, and business fit. The
              stack matters less than getting the system right.
            </p>
          </section>
        </div>

        {/* Experience + Education */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#212531] bg-[#0b0d13]/60 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#e4ded7]/70" />
              <p className="text-sm font-semibold uppercase tracking-wide text-[#e4ded7]/70">
                Work experience
              </p>
            </div>

            <div className="mt-5 space-y-5">
              <div className="rounded-xl border border-[#212531] bg-[#212531]/25 p-4">
                <p className="font-semibold text-[#e4ded7]">
                  Lead Developer & Systems Administration — Stackably LTD
                </p>
                <p className="text-sm font-medium text-[#e4ded7]/70">
                  Remote · 2025–Present
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-medium text-[#e4ded7]/75">
                  <li>Built automation tools, bots, and internal dashboards; integrated third-party APIs.</li>
                  <li>Delivered production features focused on reliability, security, and maintainable architecture.</li>
                  <li>Improved performance with caching and modular APIs; supported deployments and troubleshooting.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-[#212531] bg-[#212531]/25 p-4">
                <p className="font-semibold text-[#e4ded7]">
                  Freelance Developer — Hexoforge LLC
                </p>
                <p className="text-sm font-medium text-[#e4ded7]/70">
                  Remote · 2024–2025
                </p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm font-medium text-[#e4ded7]/75">
                  <li>Shipped client-facing platforms and internal systems across multiple initiatives.</li>
                  <li>Built dashboards and workflow tooling; optimized delivery with better DX and performance.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#212531] bg-[#0b0d13]/60 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#e4ded7]/70" />
              <p className="text-sm font-semibold uppercase tracking-wide text-[#e4ded7]/70">
                Education
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-[#212531] bg-[#212531]/25 p-4">
                <p className="font-semibold text-[#e4ded7]">Dhaka City College (DCC)</p>
                <p className="text-sm font-medium text-[#e4ded7]/70">
                  Higher Secondary Certificate (Science) — 2024–2026 (Expected)
                </p>
                <p className="mt-2 text-sm font-medium text-[#e4ded7]/75">
                  Focus: Math, English
                </p>
              </div>

              <div className="rounded-xl border border-[#212531] bg-[#212531]/25 p-4">
                <p className="font-semibold text-[#e4ded7]">AK School & College (AKSC)</p>
                <p className="text-sm font-medium text-[#e4ded7]/70">
                  Secondary School Certificate (Science) — Graduated 2024
                </p>
                <p className="mt-2 text-sm font-medium text-[#e4ded7]/75">
                  GPA: 5.00 · Activities: Robotics Club, Science Fairs, Math Olympiad Qualifier
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Certifications + Languages */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-[#212531] bg-[#0b0d13]/60 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#e4ded7]/70" />
              <p className="text-sm font-semibold uppercase tracking-wide text-[#e4ded7]/70">
                Certifications
              </p>
            </div>
            <div className="mt-5 rounded-xl border border-[#212531] bg-[#212531]/25 p-4">
              <p className="font-semibold text-[#e4ded7]">
                Gemini Certified Educator — Google for Education
              </p>
              <p className="text-sm font-medium text-[#e4ded7]/70">
                Issued Jan 2026 · Expires Jan 2029
              </p>
              <p className="mt-3 text-sm font-medium text-[#e4ded7]/75">
                Credential URL:{" "}
                <Link
                  href="http://edu.google.accredible.com/a39b5ec9-df72-489d-aa38-0b43f80e2df2"
                  target="_blank"
                  className="underline underline-offset-4 decoration-[#e4ded7]/40 hover:decoration-[#e4ded7]"
                  aria-label="Open credential"
                >
                  edu.google.accredible.com/a39b5ec9-df72-489d-aa38-0b43f80e2df2
                </Link>
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#212531] bg-[#0b0d13]/60 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <LanguagesIcon className="h-4 w-4 text-[#e4ded7]/70" />
              <p className="text-sm font-semibold uppercase tracking-wide text-[#e4ded7]/70">
                Languages
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Bengali (native)", "English (fluent)", "Japanese (basic)"].map((l) => (
                <Badge
                  key={l}
                  variant="secondary"
                  className="border border-[#212531] bg-[#212531]/40 text-[#e4ded7]"
                >
                  {l}
                </Badge>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-[#212531] bg-[#212531]/25 p-4">
              <p className="text-sm font-medium text-[#e4ded7]/75">
                If you have a brief, timeline, and business goal, send it over.
                I will tell you what I would build, what I would avoid, and
                where to start.
              </p>
              <Button
                asChild
                variant="outline"
                className="mt-4 w-full border-[#e4ded7]/20 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10"
              >
                <Link href="https://cal.com/rizwannur/30min" target="_blank" aria-label="Book a strategy call">
                  Book a strategy call
                </Link>
              </Button>
            </div>
          </section>
        </div>

        <div className="mt-12">
          <Button
            asChild
            variant="ghost"
            className="px-0 text-[#e4ded7]/80 hover:bg-transparent hover:text-[#e4ded7]"
          >
            <Link href="/#home" aria-label="Back to home">
              ← Back to home
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}


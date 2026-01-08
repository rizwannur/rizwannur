import {
  devProjects,
  projectsTitle,
  sectionHeading,
  sectionDescription,
  viewCollectionsButton,
} from "@/data/WorkSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProjectsMarquee from "@/components/projects/ProjectsMarquee";
import { monaSans } from "@/app/fonts/monaSans";

interface WorkSectionProps {
  className?: string;
}

const WorkSection = ({ className = "" }: WorkSectionProps) => {
  return (
    <section
      className={`relative z-10 flex w-full flex-col items-center justify-center bg-[#0E1016] bg-cover bg-center py-16 md:py-20 lg:py-20 ${className}`}
      id="work"
    >
      <div className="mb-12 flex w-[90%] flex-col items-start justify-between gap-6 text-[#e4ded7] lg:max-w-[1200px] lg:flex-row lg:items-end">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#e4ded7]/70">
            {projectsTitle}
          </p>
          <h2
            className={`${monaSans.className} text-4xl font-extrabold uppercase leading-[0.9em] tracking-tight md:text-[42px] lg:text-7xl lg:whitespace-nowrap`}
          >
            {sectionHeading}
          </h2>
          <p className="max-w-[720px] text-base font-medium text-[#e4ded7]/80 md:text-lg">
            {sectionDescription}
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          className="border-[#e4ded7]/40 bg-transparent text-[#e4ded7] hover:bg-[#e4ded7]/10"
        >
          <Link href="/work" aria-label={viewCollectionsButton}>
            {viewCollectionsButton}
          </Link>
        </Button>
      </div>

      <div className="w-[90%] lg:max-w-[1200px]">
        <ProjectsMarquee projects={devProjects} />
      </div>
    </section>
  );
};

export default WorkSection;

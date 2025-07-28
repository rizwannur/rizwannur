import { devProjects, projectsTitle } from "@/data/WorkSection";
import ProjectCard from "../cards/ProjectCard";
import { DevProject } from "@/lib/types";

interface WorkSectionProps {
  className?: string;
}

const WorkSection = ({ className = "" }: WorkSectionProps) => {
  return (
    <section
      className={`relative z-10 flex w-full flex-col items-center justify-center bg-[#0E1016] bg-cover bg-center py-16 md:py-20 lg:py-20 ${className}`}
      id="work"
    >
      <h2 className="mb-10 hidden text-4xl text-[#e4ded7] md:mb-16 md:text-[42px] lg:mb-16 lg:text-7xl">
        {projectsTitle}
      </h2>

      <div className="grid w-[90%] grid-cols-1 grid-rows-2 gap-y-10 gap-x-6 lg:max-w-[1200px] lg:grid-cols-1">
        {devProjects.map((project: DevProject) => (
          <ProjectCard
            key={project.id}
            project={project}
          />
        ))}
      </div>
    </section>
  );
};

export default WorkSection;

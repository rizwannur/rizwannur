import AnimatedBody from "@/components/animations/AnimatedBody";
import AnimatedWords2 from "@/components/animations/AnimatedWords2";
import { monaSans } from "@/app/fonts/monaSans";
import { techStacksData } from "@/data/TechStacks";
import LogoLoop from "@/components/LogoLoop";

interface TechStacksSectionProps {
  className?: string;
}

const TechStacksSection = ({ className = "" }: TechStacksSectionProps) => {
  const logos = techStacksData.stacks.map((stack) => ({
    node: (
      <span className="rounded-full border border-[#212531] bg-[#212531]/40 px-4 py-2 text-sm font-semibold text-[#e4ded7] backdrop-blur-sm">
        {stack.name}
      </span>
    ),
    href: stack.href,
    title: stack.name,
    ariaLabel: `Open ${stack.name}`,
  }));

  return (
    <section
      className={`z-10 flex w-full flex-col items-center justify-center overflow-hidden bg-[#0E1016] bg-cover bg-center pt-20 md:pb-16 lg:pb-24 ${className}`}
      id="stacks"
    >
      <div className="relative mb-12 flex w-[90%] max-w-[1200px] flex-col items-start justify-center gap-6 text-[#e4ded7]">
        <AnimatedWords2
          title={techStacksData.title}
          style={`flex max-w-[900px] flex-col items-start text-left ${monaSans.className} font-extrabold uppercase leading-[0.9em] text-[#e4ded7] text-[clamp(54px,8vw,110px)]`}
        />
        <AnimatedBody
          text={techStacksData.description}
          className="max-w-[720px] text-left text-[14px] font-semibold uppercase text-[#e4ded7]/70 md:text-[16px]"
        />
      </div>

      <div className="w-[90%] max-w-[1200px]">
        <LogoLoop
          logos={logos}
          speed={95}
          direction="left"
          gap={18}
          logoHeight={18}
          fadeOut
          fadeOutColor="#0E1016"
          scaleOnHover
          pauseOnHover
          ariaLabel="Tech stack logos"
        />
      </div>
    </section>
  );
};

export default TechStacksSection;

